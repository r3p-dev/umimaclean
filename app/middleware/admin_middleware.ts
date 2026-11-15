import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { accessAdmin } from '#abilities/main'

export default class AdminMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    if (!ctx.auth.user) {
      await ctx.auth.authenticateUsing([ctx.auth.defaultGuard], { loginRoute: '/staf/masuk' })
    }

    if (await ctx.bouncer.denies(accessAdmin)) {
      return ctx.response.forbidden('Akses ditolak.')
    }

    return next()
  }
}
