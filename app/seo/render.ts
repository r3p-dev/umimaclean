/**
 * The bridge between a controller and the head partial.
 *
 * A controller describes its page with a `PageSeo`; this turns it into the
 * resolved values `seo.edge` prints and hands them to Inertia as a *view*
 * prop rather than a page prop. That distinction matters: view props reach the
 * Edge template only, so the JSON-LD graph is not also serialised into the
 * page payload embedded in the HTML for the client. The graph is for crawlers;
 * shipping it twice would be pure weight on the page that must score 99.
 *
 *   return inertia.render('public/home', props, withSeo(seo))
 */

import type { PageSeo } from '#seo/types'
import { resolveHead } from '#seo/head'

export function withSeo(seo: PageSeo) {
  return { seo: resolveHead(seo) }
}
