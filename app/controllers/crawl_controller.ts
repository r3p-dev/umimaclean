import { createHash } from 'node:crypto'

import type { HttpContext } from '@adonisjs/core/http'

import { ORIGIN } from '#seo/config'
import { buildSitemap } from '#seo/sitemap'

/**
 * robots.txt and sitemap.xml, served as routes rather than static files.
 *
 * As files they would carry a hardcoded hostname, which breaks the moment the
 * site moves — and this domain is explicitly temporary. As routes they read the
 * origin from config, so moving the site is a change to APP_URL and nothing
 * else.
 */
export default class CrawlController {
  async robots({ response }: HttpContext) {
    /**
     * Everything a visitor can reach is fair game; everything behind a login,
     * or that only exists to serve the application, is not.
     *
     * `/login` and `/signup` are listed alongside `/auth` because those are the
     * paths the starter kit actually uses. When Phase 4 moves them under
     * `/auth`, the older entries stay harmless.
     */
    const lines = [
      'User-agent: *',
      'Allow: /',
      'Disallow: /dashboard',
      'Disallow: /admin',
      'Disallow: /auth',
      'Disallow: /api',
      'Disallow: /404',
      'Disallow: /login',
      'Disallow: /signup',
      '',
      `Sitemap: ${ORIGIN}/sitemap.xml`,
      '',
    ]

    return response
      .header('content-type', 'text/plain; charset=utf-8')
      .header('cache-control', 'public, max-age=86400')
      .send(lines.join('\n'))
  }

  async sitemap({ request, response }: HttpContext) {
    /** Built from the database, so `lastmod` comes from real content changes */
    const xml = await buildSitemap()

    /**
     * A strong ETag over the body. The sitemap changes rarely and crawlers
     * fetch it often, so answering most of those with a 304 is worth the
     * hash — and it keeps this route off the TTFB budget.
     */
    const etag = `"${createHash('sha256').update(xml).digest('base64url').slice(0, 27)}"`

    if (request.header('if-none-match') === etag) {
      return response.status(304).send('')
    }

    return response
      .header('content-type', 'application/xml; charset=utf-8')
      .header('cache-control', 'public, max-age=3600')
      .header('etag', etag)
      .send(xml)
  }
}
