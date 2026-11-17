#!/usr/bin/env node
// Checks a plan of suggested commits against the working tree without staging or committing anything
// (AGENTS.md "Git").
//
//   node scripts/check_commits.ts <plan-file> [--print-fish]
//
// Plan file format: one block per commit, each line `key: value`. `subject:` starts a new commit;
// `body:` adds one paragraph (one `-m`), in order; `path:` adds one git pathspec: a file, a folder
// (everything under it), or a glob where `*` also matches `/` as in git (`docs/evidence/*.log`).
// Blank lines and lines starting with `#` are ignored.
//
//   subject: docs(plan): add the active milestone section
//   body: Agents start from this section instead of reading old evidence.
//   path: docs/PLAN.md
//
// Checks: every changed path (`git status --porcelain`, untracked files included) is matched by
// exactly one commit and every pathspec matches a changed path; subjects follow Conventional Commits
// and are at most 72 characters; no AI attribution; no forbidden file is added or modified (deleting
// one is fine). --print-fish prints the fish commands when every check passes.
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

type Commit = { subject: string; bodies: string[]; paths: string[] }
type Change = { path: string; deleted: boolean }

const CONVENTIONAL =
  /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9._/-]+\))?!?: \S/
const ATTRIBUTION = /co-authored-by|generated with|claude|anthropic|\bassistant\b/i
const FORBIDDEN = [
  { pattern: /(^|\/)\.env(\.|$)/, reason: 'environment file', allowed: /(^|\/)\.env\.example$/ },
  { pattern: /\.(pbf|osrm[.a-z_]*|pmtiles|mbtiles)$/, reason: 'map data' },
  { pattern: /^(storage|public\/tiles)\//, reason: 'map data or uploads' },
  { pattern: /\.(dump|backup|sql\.gz|pgdump)$/, reason: 'database dump' },
  { pattern: /\.log$/, reason: 'log file' },
  {
    pattern: /^docs\/evidence\/.*\.(png|jpe?g|gif|webp|avif|svg)$/i,
    reason: 'image under docs/evidence',
  },
]

function parsePlan(text: string) {
  const commits: Commit[] = []
  const errors: string[] = []
  text.split('\n').forEach((raw, index) => {
    const line = raw.trim()
    if (!line || line.startsWith('#')) {
      return
    }
    const match = line.match(/^(subject|body|path):\s*(.*)$/)
    const current = commits.at(-1)
    if (!match) {
      errors.push(`line ${index + 1}: expected "subject:", "body:" or "path:"`)
    } else if (match[1] === 'subject') {
      commits.push({ subject: match[2], bodies: [], paths: [] })
    } else if (!current) {
      errors.push(`line ${index + 1}: "${match[1]}:" before the first "subject:"`)
    } else if (match[1] === 'body') {
      current.bodies.push(match[2])
    } else {
      current.paths.push(match[2])
    }
  })
  return { commits, errors }
}

function changedPaths() {
  const entries = execFileSync('git', ['status', '--porcelain=v1', '-z', '--untracked-files=all'], {
    encoding: 'utf8',
  }).split('\0')
  const changes: Change[] = []
  for (let index = 0; index < entries.length; index++) {
    const entry = entries[index]
    if (!entry) {
      continue
    }
    const xy = entry.slice(0, 2)
    changes.push({ path: entry.slice(3), deleted: xy !== '??' && xy.includes('D') })
    if (xy.startsWith('R') || xy.startsWith('C')) {
      changes.push({ path: entries[++index], deleted: xy.startsWith('R') })
    }
  }
  return changes
}

function matches(pathspec: string, file: string) {
  const folder = pathspec.replace(/\/+$/, '')
  if (file === folder || file.startsWith(`${folder}/`)) {
    return true
  }
  if (!/[*?]/.test(pathspec)) {
    return false
  }
  const escaped = pathspec.replace(/[.+^${}()|\\]/g, '\\$&')
  return new RegExp(`^${escaped.replaceAll('*', '.*').replaceAll('?', '.')}$`).test(file)
}

function check(commits: Commit[], changes: Change[]) {
  const errors: string[] = []
  const owners = new Map<string, string[]>()

  for (const [index, commit] of commits.entries()) {
    const label = `commit ${index + 1} "${commit.subject}"`
    if (commit.subject.length > 72) {
      errors.push(`${label}: subject is ${commit.subject.length} characters (max 72)`)
    }
    if (!CONVENTIONAL.test(commit.subject)) {
      errors.push(`${label}: subject is not "type(scope): subject" (Conventional Commits)`)
    }
    for (const text of [commit.subject, ...commit.bodies]) {
      if (ATTRIBUTION.test(text)) {
        errors.push(`${label}: AI attribution in "${text}"`)
      }
    }
    if (!commit.paths.length) {
      errors.push(`${label}: no paths`)
    }
    for (const pathspec of commit.paths) {
      if (pathspec.includes('[')) {
        errors.push(`${label}: "[" is not supported in pathspecs: ${pathspec}`)
      }
      const matched = changes.filter((change) => matches(pathspec, change.path))
      if (!matched.length) {
        errors.push(`${label}: ${pathspec} matches no changed path`)
      }
      for (const change of matched) {
        owners.set(change.path, [...(owners.get(change.path) ?? []), `${index + 1}`])
      }
    }
  }

  for (const change of changes) {
    const owner = owners.get(change.path) ?? []
    if (owner.length === 0) {
      errors.push(`${change.path}: changed but in no commit`)
    } else if (owner.length > 1) {
      errors.push(`${change.path}: listed more than once (commits ${owner.join(', ')})`)
    }
    const forbidden = FORBIDDEN.find(
      (rule) => rule.pattern.test(change.path) && !rule.allowed?.test(change.path)
    )
    if (forbidden && !change.deleted) {
      errors.push(`${change.path}: ${forbidden.reason} must not be added or modified`)
    }
  }
  return errors
}

function fishQuote(text: string) {
  return `"${text.replace(/[\\"$]/g, '\\$&')}"`
}

function fishPath(pathspec: string) {
  return /^[A-Za-z0-9._/@+-]+$/.test(pathspec)
    ? pathspec
    : `'${pathspec.replace(/[\\']/g, '\\$&')}'`
}

const [planFile, ...flags] = process.argv.slice(2)
if (!planFile || flags.some((flag) => flag !== '--print-fish')) {
  console.error('Usage: node scripts/check_commits.ts <plan-file> [--print-fish]')
  process.exit(2)
}

const plan = parsePlan(readFileSync(planFile, 'utf8'))
const changes = changedPaths()
const errors = [...plan.errors, ...check(plan.commits, changes)]

if (errors.length) {
  console.log(`FAIL ${errors.length} problem(s) in ${planFile}:`)
  console.log(errors.map((error) => `- ${error}`).join('\n'))
  process.exit(1)
}

console.log(`PASS ${plan.commits.length} commits cover ${changes.length} changed paths`)
if (flags.includes('--print-fish')) {
  for (const commit of plan.commits) {
    const messages = [commit.subject, ...commit.bodies].map((text) => `-m ${fishQuote(text)}`)
    console.log(
      `git add ${commit.paths.map(fishPath).join(' ')}; and git commit ${messages.join(' ')}`
    )
  }
}
