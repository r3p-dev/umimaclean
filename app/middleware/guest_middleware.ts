import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { Authenticators } from '@adonisjs/auth/types'

export default class GuestMiddleware {
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: { guards?: (keyof Authenticators)[] } = {}
  ) {
    for (const guard of options.guards || [ctx.auth.defaultGuard]) {
      if (await ctx.auth.use(guard).check()) {
        ctx.session.reflash()
        const user = ctx.auth.use(guard).user
        if (user?.role === 'admin') {
          return ctx.response.redirect('/admin', true)
        }
        if (user?.role === 'staff') {
          return ctx.response.redirect('/staf', true)
        }
        return ctx.response.redirect('/beranda', true)
      }
    }

    return next()
  }
}
