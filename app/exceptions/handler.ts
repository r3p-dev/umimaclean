import app from '@adonisjs/core/services/app'
import { ExceptionHandler } from '@adonisjs/core/http'
import type { StatusPageRange, StatusPageRenderer } from '@adonisjs/core/types/http'

export default class HttpExceptionHandler extends ExceptionHandler {
  protected override debug = !app.inProduction

  // Outside production the debug page shows the error instead of the status page.
  protected override renderStatusPages = app.inProduction

  protected override statusPages: Record<StatusPageRange, StatusPageRenderer> = {
    '404': (_, { inertia }) => inertia.render('errors/not_found', {}),
    '500..599': (_, { inertia }) => inertia.render('errors/server_error', {}),
  }
}
