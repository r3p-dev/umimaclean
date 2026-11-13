import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

// Looks up the signed-in user on every request without requiring one.
export default class SilentAuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    await ctx.auth.check()

    return next()
  }
}
