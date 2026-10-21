import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { Authenticators } from '@adonisjs/auth/types'

export default class AuthMiddleware {
  redirectTo = '/masuk'

  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: { guards?: (keyof Authenticators)[]; loginRoute?: string } = {}
  ) {
    if (!(await ctx.auth.check()) && ctx.request.method() === 'GET') {
      ctx.session.setIntendedUrl(ctx.request.url(true))
    }

    await ctx.auth.authenticateUsing(options.guards, {
      loginRoute: options.loginRoute ?? this.redirectTo,
    })

    return next()
  }
}
