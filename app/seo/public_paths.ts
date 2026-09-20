/**
 * Every public, indexable path on the site.
 *
 * This is the single source of truth shared by `npm run verify:seo` and the
 * database-driven sitemap, so the crawler's view of the site and the gate that
 * protects it can never drift apart. Paths generated from database rows (area
 * pages, blog posts) are appended by the sitemap at request time; this list
 * holds the ones fixed at build time.
 *
 * `trailingSlash: never` — write '/layanan/cuci-sepatu', never a trailing slash.
 */
export const PUBLIC_PATHS = [
  '/',
  '/layanan',
  '/layanan/cuci-sepatu',
  '/layanan/cuci-tas',
  '/layanan/cuci-helm',
  '/layanan/reparasi-sepatu',
  '/harga',
  '/faq',
  '/tentang',
  '/kontak',
  '/pesan',
  '/area',
  '/area/kota-bandung',
  '/area/kota-cimahi',
  '/area/bandung-selatan',
  '/area/telkom-university',
  '/area/buahbatu',
  '/area/dago',
  '/area/antapani',
  '/area/cibiru',
  '/area/ujungberung',
  '/area/kopo',
  '/area/soreang',
  '/area/baleendah',
] as const

export type PublicPath = (typeof PUBLIC_PATHS)[number]
