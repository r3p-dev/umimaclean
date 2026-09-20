import app from '@adonisjs/core/services/app'

import { withSeo } from '#seo/render'
import { type HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import type { StatusPageRange, StatusPageRenderer } from '@adonisjs/core/types/http'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * Status pages are used to display a custom HTML pages for certain error
   * codes. You might want to enable them in production only, but feel
   * free to enable them in development as well.
   */
  protected renderStatusPages = app.inProduction

  /**
   * Status pages is a collection of error code range and a callback
   * to return the HTML contents to send as a response.
   */
  /**
   * Error pages get a real PageSeo so they carry a title and an explicit
   * noindex, rather than falling through to the layout's bare fallback. A 404
   * that returns 200 with a friendly message is the "soft 404" Google warns
   * about; these return the real status and ask not to be indexed.
   */
  protected statusPages: Record<StatusPageRange, StatusPageRenderer> = {
    '404': (_, { inertia, request }) =>
      inertia.render(
        'errors/not_found',
        {},
        withSeo({
          path: request.url(),
          title: 'Halaman tidak ditemukan',
          description: 'Halaman yang Anda cari tidak ada di situs UmimaClean.',
          noindex: true,
        })
      ),
    '500..599': (_, { inertia, request }) =>
      inertia.render(
        'errors/server_error',
        {},
        withSeo({
          path: request.url(),
          title: 'Terjadi kesalahan',
          description: 'Terjadi kesalahan di sisi server UmimaClean.',
          noindex: true,
        })
      ),
  }

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    return super.handle(error, ctx)
  }

  /**
   * The method is used to report error to the logging service or
   * the a third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
