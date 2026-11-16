import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

// Looks up the signed-in user on every request without requiring one,
// and ensures active sessions are tagged with the user ID for ACC-5 session management.
export default class SilentAuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    await ctx.auth.check()

    const initialUser = ctx.auth.user
    if (initialUser && ctx.session?.supportsTagging?.()) {
      await ctx.session.tag(String(initialUser.id))
    }

    const result = await next()

    if (ctx.auth.user && ctx.session?.supportsTagging?.()) {
      await ctx.session.tag(String(ctx.auth.user.id))
    } else if (initialUser && !ctx.auth.user && ctx.session?.supportsTagging?.()) {
      await ctx.session.untag(String(initialUser.id))
    }

    return result
  }
}
