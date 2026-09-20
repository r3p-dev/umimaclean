/**
 * The single SEO contract.
 *
 * Every controller that renders a public page returns one of these. It is
 * handed to the root Edge template as a view prop, and
 * `resources/views/partials/seo.edge` turns it into head tags. Nothing else in
 * the application writes SEO markup, so this type is the whole surface area.
 */

/**
 * The site is Indonesian only. This alias exists so that adding a second
 * language later is a change to one line plus the hreflang branch in the
 * partial, rather than a hunt through string literals.
 */
export type Locale = 'id'

export type PageSeo = {
  /** Path this page lives at, e.g. '/layanan/cuci-sepatu'. No trailing slash. */
  path: string

  /** Raw title. The ' · Umima.clean' suffix is applied by `pageTitle()`. */
  title: string

  /** The search snippet. Write it for a human deciding whether to click. */
  description: string

  locale?: Locale

  type?: 'website' | 'article' | 'profile'

  /** Sends `noindex, follow` and suppresses hreflang entirely. */
  noindex?: boolean

  /** Absolute or root-relative image path. Falls back to the default OG image. */
  image?: string
  imageAlt?: string

  /** ISO 8601. Emitted as `article:published_time` / `article:modified_time`. */
  published?: string
  modified?: string

  tags?: readonly string[]

  /** Paginated listings only. */
  prev?: string
  next?: string

  /** Nodes for the JSON-LD `@graph`. Built in `app/seo/schema.ts`. */
  jsonLd?: readonly object[]
}
