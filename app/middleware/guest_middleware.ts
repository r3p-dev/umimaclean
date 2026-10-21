import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { LoginRedirect } from '#enums/role_enum'

export default class GuestMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    if (await ctx.auth.check()) {
      return ctx.response.redirect().toRoute(LoginRedirect[ctx.auth.getUserOrFail().role])
    }

    return next()
  }
}
