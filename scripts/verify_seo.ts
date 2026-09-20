/**
 * verify:seo — the gate that proves the first HTML response is crawlable.
 *
 * Inertia is a SPA. Server-side rendering can break silently: a missing
 * `serverEntryPoints`, a hydration-only <Head>, a bad deploy, and the page
 * still looks perfect in a browser while a crawler receives an empty shell.
 * This script fetches the RAW HTML of every public URL — no JavaScript is ever
 * executed — and fails loudly if the crawler would not find what it needs.
 *
 * It runs against BASE_URL, so the same script gates CI and can be pointed at
 * production after a deploy.
 *
 *   npm run verify:seo
 *   BASE_URL=https://skripsi.r3p.dev npm run verify:seo
 */

import { PUBLIC_PATHS } from '#seo/public_paths'

const BASE_URL = (process.env.BASE_URL ?? 'http://localhost:3333').replace(/\/+$/, '')

/**
 * UmimaClean is not a laundry. These words must never reach a rendered page:
 * they attract the wrong search intent and describe a different business.
 */
const BANNED_WORDS = [
  'kiloan',
  'satuan',
  'dry clean',
  'dry cleaning',
  'setrika',
  'laundry',
  'londri',
]

type Failure = { path: string; problem: string }

const failures: Failure[] = []
const titlesSeen = new Map<string, string>()

/** path -> the public paths it links to, for the reachability pass below */
const outgoing = new Map<string, Set<string>>()

/** Strip tags and collapse whitespace, so "text present" means text a human sees */
function textOf(html: string) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Normalise a URL for comparison — trailingSlash: never, so '/x/' and '/x' are one page */
function normalise(url: string) {
  return url.replace(/\/+$/, '') || '/'
}

console.log(`verify:seo — checking ${PUBLIC_PATHS.length} public URL(s) against ${BASE_URL}\n`)

for (const path of PUBLIC_PATHS) {
  const url = `${BASE_URL}${path === '/' ? '/' : path}`
  const fail = (problem: string) => failures.push({ path, problem })

  /** Fetch the document exactly as a crawler would: one GET, no JS, no retries */
  let response: Response
  let html: string
  try {
    response = await fetch(url, { headers: { 'user-agent': 'umimaclean-verify-seo' } })
    html = await response.text()
  } catch (error) {
    fail(`request failed — ${(error as Error).message}`)
    console.log(`  ✗ ${path}`)
    continue
  }

  if (response.status !== 200) {
    fail(`expected status 200, received ${response.status}`)
    console.log(`  ✗ ${path}`)
    continue
  }

  /** Exactly one <h1>, carrying real text — the page's single subject */
  const h1s = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi) ?? []
  const [firstH1] = h1s
  if (!firstH1) {
    fail('no <h1> in the raw HTML')
  } else if (h1s.length > 1) {
    fail(`${h1s.length} <h1> elements — a page must have exactly one`)
  } else if (textOf(firstH1).length === 0) {
    fail('<h1> is empty')
  }

  /** A non-empty <title>, unique across the whole site */
  const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)
  const title = titleMatch ? textOf(titleMatch[1]) : ''
  if (!titleMatch) {
    fail('no <title>')
  } else if (title.length === 0) {
    fail('<title> is empty')
  } else if (titlesSeen.has(title)) {
    fail(`<title> "${title}" duplicates ${titlesSeen.get(title)}`)
  } else {
    titlesSeen.set(title, path)
  }

  /** A meta description — this is the snippet under the search result */
  const description = html.match(
    /<meta\b[^>]*\bname=["']description["'][^>]*\bcontent=["']([^"']*)["']/i
  )
  if (!description) {
    fail('no meta[name=description]')
  } else if (description[1].trim().length === 0) {
    fail('meta[name=description] is empty')
  }

  /** An absolute canonical pointing at this exact page */
  const canonical = html.match(/<link\b[^>]*\brel=["']canonical["'][^>]*\bhref=["']([^"']+)["']/i)
  if (!canonical) {
    fail('no link[rel=canonical]')
  } else if (!/^https?:\/\//i.test(canonical[1])) {
    fail(`canonical "${canonical[1]}" is not absolute`)
  } else if (normalise(canonical[1]) !== normalise(url)) {
    fail(`canonical "${canonical[1]}" does not match "${url}"`)
  }

  /** Structured data that actually parses — a malformed graph is worse than none */
  const blocks =
    html.match(/<script\b[^>]*\btype=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) ??
    []
  if (blocks.length === 0) {
    fail('no application/ld+json block')
  } else {
    for (const block of blocks) {
      const body = block.replace(/^[\s\S]*?>/, '').replace(/<\/script>$/i, '')
      try {
        JSON.parse(body)
      } catch (error) {
        fail(`application/ld+json does not parse — ${(error as Error).message}`)
      }
    }
  }

  /**
   * Record where this page links, so the reachability pass can walk the site
   * the way a crawler does.
   */
  const links = new Set<string>()
  for (const match of html.matchAll(/<a\b[^>]*\shref=["']([^"']+)["']/gi)) {
    const href = match[1]
    if (!href || href.startsWith('#') || /^[a-z]+:/i.test(href)) continue

    const target = normalise(href.split('#')[0]!.split('?')[0]!)
    if (target !== path) links.add(target)
  }
  outgoing.set(path, links)

  /** UmimaClean is not a laundry */
  const haystack = textOf(html).toLowerCase()
  for (const word of BANNED_WORDS) {
    if (haystack.includes(word)) {
      fail(`banned laundry vocabulary in rendered copy: "${word}"`)
    }
  }

  const failedHere = failures.filter((failure) => failure.path === path)
  console.log(`  ${failedHere.length === 0 ? '✓' : '✗'} ${path}${title ? ` — ${title}` : ''}`)
}

/**
 * Reachability: every public URL must be findable by clicking from the
 * homepage.
 *
 * A page absent from the navigation is an orphan. It can sit in the sitemap
 * looking healthy while receiving no internal link weight at all, and a reader
 * can only reach it by typing the URL. That is a defect the build should catch,
 * not something to notice months later.
 */
const MAX_CLICKS = 2
const depth = new Map<string, number>([['/', 0]])
const queue: string[] = ['/']

while (queue.length > 0) {
  const current = queue.shift()!
  for (const target of outgoing.get(current) ?? []) {
    if (depth.has(target)) continue
    depth.set(target, depth.get(current)! + 1)
    queue.push(target)
  }
}

console.log('\nreachability from the homepage:')
for (const path of PUBLIC_PATHS) {
  const clicks = depth.get(path)

  if (clicks === undefined) {
    failures.push({ path, problem: 'orphan — not reachable from / by following links' })
    console.log(`  ✗ ${path} — orphan`)
    continue
  }

  if (clicks > MAX_CLICKS) {
    failures.push({ path, problem: `${clicks} clicks from the homepage, limit is ${MAX_CLICKS}` })
    console.log(`  ✗ ${path} — ${clicks} clicks`)
    continue
  }

  console.log(`  ✓ ${path} — ${clicks} click${clicks === 1 ? '' : 's'}`)
}

/** Report and set the exit code, because CI only reads the exit code */
if (failures.length > 0) {
  console.error(`\n${failures.length} problem(s):\n`)
  for (const { path, problem } of failures) {
    console.error(`  ${path}: ${problem}`)
  }
  console.error('')
  process.exit(1)
}

console.log(`\nAll ${PUBLIC_PATHS.length} public URL(s) are crawlable.`)
