/**
 * Canonical URLs.
 *
 * One page, one address. Every other spelling of that address — a trailing
 * slash, the other host, a stray query string — must point back here, or the
 * ranking signals for a page get split across several URLs that Google treats
 * as different pages.
 */

import type { Locale } from '#seo/types'
import { ORIGIN } from '#seo/config'

/**
 * trailingSlash: never. The homepage is the one exception: its canonical is
 * the origin with a single slash, because an empty path is not a URL.
 */
export function normalisePath(path: string) {
  if (!path.startsWith('/')) {
    path = `/${path}`
  }

  const trimmed = path.replace(/\/+$/, '')

  return trimmed === '' ? '/' : trimmed
}

/**
 * The absolute, canonical URL for a path.
 *
 * `locale` is accepted but unused: the site is Indonesian only. It is in the
 * signature so that adding a second language does not mean touching every
 * call site — see the note on `alternates` below.
 */
export function canonical(path: string, _locale: Locale = 'id') {
  const normalised = normalisePath(path)

  return normalised === '/' ? `${ORIGIN}/` : `${ORIGIN}${normalised}`
}

/**
 * Deliberately not implemented.
 *
 * The benchmark this SEO module is modelled on (r3p.dev) is bilingual and
 * therefore emits a full set of hreflang links plus x-default. UmimaClean is
 * Indonesian only, and hreflang on a single-language site is at best noise and
 * at worst a self-contradiction if the set is ever incomplete or one-way.
 *
 * If the site becomes bilingual: return every locale's URL plus x-default
 * here, emit them in `seo.edge`, and keep them bidirectional — every page in
 * the set must list every other page in the set, itself included.
 */
export const alternates = undefined
