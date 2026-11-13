import type { HttpContext } from '@adonisjs/core/http'
import { appUrl } from '#config/app'

// The public pages crawlers may list (GUEST-3); everything else is for signed-in users or development.
const PUBLIC_PATHS = ['/', '/login', '/signup', '/syarat', '/privasi']
const PRIVATE_PREFIXES = ['/dashboard', '/_preview']

export default class SeoController {
  async robots({ response }: HttpContext) {
    response.header('content-type', 'text/plain; charset=utf-8')
    return [
      'User-agent: *',
      ...PRIVATE_PREFIXES.map((prefix) => `Disallow: ${prefix}`),
      `Sitemap: ${appUrl}/sitemap.xml`,
      '',
    ].join('\n')
  }

  async sitemap({ response }: HttpContext) {
    const urls = PUBLIC_PATHS.map((path) => `  <url><loc>${appUrl}${path}</loc></url>`)
    response.header('content-type', 'application/xml; charset=utf-8')
    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urls,
      '</urlset>',
      '',
    ].join('\n')
  }
}
