import app from '@adonisjs/core/services/app'
import { ExceptionHandler } from '@adonisjs/core/http'
import type { HttpContext } from '@adonisjs/core/http'
import type { StatusPageRange, StatusPageRenderer } from '@adonisjs/core/types/http'

export default class HttpExceptionHandler extends ExceptionHandler {
  protected override debug = !app.inProduction

  // Outside production the debug page shows the error instead of the status page.
  protected override renderStatusPages = app.inProduction

  protected override statusPages: Record<StatusPageRange, StatusPageRenderer> = {
    '404': (_, { inertia }) => inertia.render('errors/not_found', {}),
    '500..599': (_, { inertia }) => inertia.render('errors/server_error', {}),
  }

  // D48: Populates the 'errors' session key alongside 'inputErrorsBag'
  // so that official Japa assertion helpers (assertValidationError) find validation messages.
  override async renderValidationErrorAsHTML(error: any, ctx: HttpContext) {
    if (ctx.session) {
      const messages = error.messages || []
      const errorsMap: Record<string, string[]> = {}
      for (const msg of messages) {
        if (msg.field) {
          if (!errorsMap[msg.field]) {
            errorsMap[msg.field] = []
          }
          errorsMap[msg.field].push(msg.message)
        }
      }
      ctx.session.flash('errors', errorsMap)
    }

    return super.renderValidationErrorAsHTML(error, ctx)
  }
}
