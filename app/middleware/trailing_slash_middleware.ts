import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * trailingSlash: never.
 *
 * `/harga` and `/harga/` are the same page, and left alone both would return
 * 200 — two URLs sharing one page's ranking signals, and a canonical tag that
 * disagrees with the URL the visitor is on. A 301 collapses them permanently.
 */
export default class TrailingSlashMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const url = ctx.request.url()

    if (url.length > 1 && url.endsWith('/')) {
      /**
       * `forwardQueryString: true` carries the original query across, so a
       * campaign link like /harga/?utm_source=ig does not lose its attribution
       * on the way to the canonical URL.
       */
      return ctx.response.redirect(url.replace(/\/+$/, ''), true, 301)
    }

    return next()
  }
}
