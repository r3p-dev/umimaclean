/**
 * Turns a `PageSeo` into the flat set of values `seo.edge` prints.
 *
 * All the thinking — defaults, absolute URLs, the robots string, JSON-LD
 * serialisation and escaping — happens here in TypeScript, where it can be
 * read and tested. The Edge partial stays deliberately dumb: it prints what it
 * is given and makes no decisions.
 */

import type { PageSeo } from '#seo/types'
import { canonical } from '#seo/urls'
import { siteNodes } from '#seo/schema'
import { SITE, OG_LOCALES, DEFAULT_OG_IMAGE, absolute, pageTitle } from '#seo/config'

export type SeoHead = {
  siteName: string
  title: string
  description: string
  canonical: string
  robots: string
  locale: string
  ogType: string
  ogLocaleAlternates: readonly string[]
  image: string
  imageAlt: string
  /** Width/height/type are only emitted for the default image, the one we measured. */
  imageWidth?: number
  imageHeight?: number
  imageType?: string
  published?: string
  modified?: string
  tags: readonly string[]
  prev?: string
  next?: string
  /** Already serialised and escaped. Print it raw. */
  jsonLd: string
}

/**
 * Serialise the graph and escape `<` as \u003c.
 *
 * This is mandatory. Any string that reaches the graph — a service name, a
 * customer question, a district — could otherwise contain `</script>` and end
 * the block early, turning the rest of the JSON into live markup. Escaping the
 * `<` makes that impossible while leaving the JSON semantically identical.
 */
function serialise(nodes: readonly object[]) {
  const graph = { '@context': 'https://schema.org', '@graph': nodes }

  return JSON.stringify(graph).replace(/</g, '\\u003c')
}

export function resolveHead(seo: PageSeo): SeoHead {
  const url = canonical(seo.path)

  /**
   * A page either wants to be found or it does not. When it does not, the
   * hreflang links are omitted entirely rather than pointing at a page we have
   * just told the crawler to ignore.
   */
  const robots = seo.noindex
    ? 'noindex, follow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'

  /**
   * Fall back to the default share image. Dimensions are only claimed for that
   * one, because that is the only image whose dimensions we actually know.
   */
  const usingDefaultImage = seo.image === undefined
  const image = absolute(seo.image ?? DEFAULT_OG_IMAGE.path)
  const imageAlt = seo.imageAlt ?? DEFAULT_OG_IMAGE.alt

  /**
   * Site-level nodes travel with every page, so the business entity is
   * reinforced site-wide rather than only on the homepage.
   */
  const nodes = [...siteNodes(), ...(seo.jsonLd ?? [])]

  return {
    siteName: SITE.name,
    title: pageTitle(seo.title),
    description: seo.description,
    canonical: url,
    robots,
    locale: SITE.locale,
    ogType: seo.type ?? 'website',
    ogLocaleAlternates: OG_LOCALES.slice(1),
    image,
    imageAlt,
    imageWidth: usingDefaultImage ? DEFAULT_OG_IMAGE.width : undefined,
    imageHeight: usingDefaultImage ? DEFAULT_OG_IMAGE.height : undefined,
    imageType: usingDefaultImage ? DEFAULT_OG_IMAGE.type : undefined,
    published: seo.published,
    modified: seo.modified,
    tags: seo.tags ?? [],
    prev: seo.prev ? absolute(seo.prev) : undefined,
    next: seo.next ? absolute(seo.next) : undefined,
    jsonLd: serialise(nodes),
  }
}
