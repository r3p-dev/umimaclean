import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { accessCustomer } from '#abilities/main'

export default class CustomerMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    if (!ctx.auth.user) {
      await ctx.auth.authenticateUsing([ctx.auth.defaultGuard], { loginRoute: '/masuk' })
    }

    if (await ctx.bouncer.denies(accessCustomer)) {
      return ctx.response.forbidden('Akses ditolak.')
    }

    return next()
  }
}
