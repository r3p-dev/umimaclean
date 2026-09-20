/**
 * Site constants — the single place the business's identity is written down.
 *
 * Every value here comes from the owner and matches the Google Business
 * Profile character for character. NAP consistency is what lets Google merge
 * the website, the profile, and directory listings into one business entity,
 * so a "tidy-up" of the punctuation here is a real ranking regression. Do not
 * edit these strings without the owner saying so.
 */

import env from '#start/env'

/**
 * Read from APP_URL rather than hardcoded, because the domain is temporary:
 * the site currently lives at skripsi.r3p.dev and will move. Nothing else in
 * the codebase may know the host.
 */
export const ORIGIN = env.get('APP_URL').replace(/\/+$/, '')

/**
 * The NAP itself lives in app/content/business.ts, which imports nothing and
 * is therefore safe to bundle into the client as well. Re-exported here so
 * that `#seo/config` remains the one import the SEO module reaches for.
 */
export { SITE, PROFILES } from '#content/business'

/** Indonesian only, so a single Open Graph locale and no alternates. */
export const OG_LOCALES = ['id_ID'] as const

/**
 * The fallback share image, generated from the real logo. Width, height, and
 * type are emitted only for this image, because they are only known for this
 * image — claiming dimensions for a page-supplied one would be a guess.
 */
export const DEFAULT_OG_IMAGE = {
  path: '/images/og-default.jpg',
  width: 1200,
  height: 630,
  type: 'image/jpeg',
  alt: 'Logo Umima Clean dengan keterangan cuci dan reparasi sepatu, tas, helm serta antar jemput gratis se-Bandung',
} as const

/** Turn a root-relative path into an absolute URL; pass absolute URLs through. */
export function absolute(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path
  }

  return `${ORIGIN}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * Titles get a ' · Umima.clean' suffix — unless that pushes the result past 60
 * characters, in which case the suffix is dropped rather than the title being
 * truncated. Google shows roughly 60 characters, and a title that survives
 * intact reads better in the results than a branded one cut off mid-word.
 */
const TITLE_SUFFIX = ' · Umima.clean'
const TITLE_LIMIT = 60

export function pageTitle(title: string) {
  const suffixed = `${title}${TITLE_SUFFIX}`

  return suffixed.length > TITLE_LIMIT ? title : suffixed
}
