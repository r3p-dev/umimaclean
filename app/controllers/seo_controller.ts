import type { HttpContext } from '@adonisjs/core/http'
import env from '#start/env'

const PUBLIC_PATHS = ['/', '/masuk', '/daftar', '/syarat', '/privasi']

export default class SeoController {
  async robots({ response }: HttpContext) {
    const base = env.get('APP_URL').replace(/\/$/, '')
    response.header('content-type', 'text/plain; charset=utf-8')

    return [
      'User-agent: *',
      'Disallow: /staf',
      'Disallow: /admin',
      'Disallow: /pesan',
      'Disallow: /pesanan',
      'Disallow: /profil',
      'Disallow: /beranda',
      'Disallow: /verifikasi',
      'Disallow: /foto-bukti',
      `Sitemap: ${base}/sitemap.xml`,
      '',
    ].join('\n')
  }

  async sitemap({ response }: HttpContext) {
    const base = env.get('APP_URL').replace(/\/$/, '')
    const urls = PUBLIC_PATHS.map((path) => `  <url><loc>${base}${path}</loc></url>`).join('\n')

    response.header('content-type', 'application/xml; charset=utf-8')
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
  }
}
