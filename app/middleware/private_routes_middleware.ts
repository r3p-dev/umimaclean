import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * `X-Robots-Tag: noindex` on everything that is not public.
 *
 * robots.txt asks crawlers not to fetch these paths, but a disallowed URL can
 * still be indexed from an inbound link — robots.txt controls crawling, not
 * indexing. The header is the part that actually keeps them out of the index,
 * and it applies by prefix so routes added in later phases are covered the day
 * they are written rather than the day someone remembers.
 */
const PRIVATE_PREFIXES = ['/dashboard', '/admin', '/auth', '/api', '/login', '/signup']

export default class PrivateRoutesMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const url = ctx.request.url()

    if (PRIVATE_PREFIXES.some((prefix) => url === prefix || url.startsWith(`${prefix}/`))) {
      ctx.response.header('x-robots-tag', 'noindex, nofollow')
    }

    return next()
  }
}
