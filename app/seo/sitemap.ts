/**
 * The sitemap, and the honest `lastmod` behind it.
 *
 * A sitemap that stamps `new Date()` on every URL tells crawlers the whole
 * site changed on every crawl. They learn to ignore it, and the one signal a
 * sitemap genuinely provides is gone. So every public page has a row in
 * `content_pages` holding a hash of the content that renders it, and the sync
 * below moves `updated_at` only when that hash actually changes.
 *
 * Blog posts and any other database-backed content join the same table when
 * they arrive, so the sitemap keeps reading from one place.
 */

import { createHash } from 'node:crypto'

import ContentPage from '#models/content_page'
import { AREAS } from '#content/areas'
import { COVERAGE_MAP } from '#content/coverage_map'
import { SITE } from '#seo/config'
import { canonical } from '#seo/urls'
import { SERVICES } from '#content/services'
import { FAQS, STEPS, BENEFITS, TERMS } from '#content/site'

/**
 * Every public page paired with the content that decides what it looks like.
 * Hashing the content — not the file, not the timestamp — is what makes
 * `lastmod` mean "this page changed" rather than "we deployed".
 */
export function collectPages() {
  const pages: { path: string; content: unknown }[] = [
    { path: '/', content: { site: SITE, steps: STEPS, benefits: BENEFITS, services: SERVICES } },
    { path: '/layanan', content: SERVICES.map((service) => service.name) },
    { path: '/harga', content: SERVICES },
    { path: '/faq', content: { faqs: FAQS, terms: TERMS } },
    { path: '/kontak', content: SITE },
    { path: '/tentang', content: { site: SITE, services: SERVICES.map((s) => s.turnaround) } },
    { path: '/pesan', content: { services: SERVICES.map((s) => s.slug), areas: AREAS.length } },
    { path: '/area', content: { areas: AREAS.map((area) => area.slug), map: COVERAGE_MAP } },
  ]

  for (const service of SERVICES) {
    pages.push({ path: service.path, content: service })
  }

  for (const area of AREAS) {
    pages.push({ path: `/area/${area.slug}`, content: { area, map: COVERAGE_MAP } })
  }

  return pages
}

/** A stable hash: key order must not change the result, or every page churns. */
function hashContent(content: unknown) {
  return createHash('sha256').update(stableStringify(content)).digest('hex')
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value) ?? 'null'
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`
  }

  const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
    a.localeCompare(b)
  )

  return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`).join(',')}}`
}

/**
 * Reconcile the database with the pages the code currently defines.
 *
 * Run by `node ace sitemap:sync`, which belongs in the deploy step right after
 * migrations. Rows whose hash is unchanged are left completely alone, so their
 * `updated_at` keeps pointing at the last real edit.
 */
export async function syncContentPages() {
  const pages = collectPages()
  const existing = await ContentPage.all()
  const byPath = new Map(existing.map((row) => [row.path, row]))

  let created = 0
  let updated = 0
  let untouched = 0

  for (const page of pages) {
    const contentHash = hashContent(page.content)
    const row = byPath.get(page.path)

    if (!row) {
      await ContentPage.create({ path: page.path, contentHash })
      created += 1
      continue
    }

    if (row.contentHash === contentHash) {
      untouched += 1
      continue
    }

    row.contentHash = contentHash
    await row.save()
    updated += 1
  }

  /** A page removed from the code must not linger in the sitemap as a 404. */
  const livePaths = new Set(pages.map((page) => page.path))
  const stale = existing.filter((row) => !livePaths.has(row.path))
  for (const row of stale) {
    await row.delete()
  }

  return { created, updated, untouched, removed: stale.length }
}

/**
 * Priority from path depth, the same shape the benchmark's sitemap
 * `serialize()` uses: the homepage is the most important thing on the site and
 * every level down is worth a little less.
 */
export function priorityFor(path: string) {
  const depth = path === '/' ? 0 : path.split('/').filter(Boolean).length

  if (depth === 0) return '1.0'
  if (depth === 1) return '0.8'
  if (depth === 2) return '0.6'

  return '0.5'
}

/** Escape the five XML entities. Slugs are safe today; content need not stay so. */
function xmlEscape(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function buildSitemap() {
  /** Deepest-first would be arbitrary; alphabetical by path keeps diffs readable */
  const rows = await ContentPage.query().orderBy('path', 'asc')

  const urls = rows
    .map((row) => {
      const location = xmlEscape(canonical(row.path))
      /** Whole seconds: milliseconds are valid W3C datetime but pure noise here */
      const lastmod = row.updatedAt.toUTC().startOf('second').toISO({ suppressMilliseconds: true })

      return [
        '  <url>',
        `    <loc>${location}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        `    <priority>${priorityFor(row.path)}</priority>`,
        '  </url>',
      ].join('\n')
    })
    .join('\n')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
    '',
  ].join('\n')
}
