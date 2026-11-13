import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import UserTransformer from '#transformers/user_transformer'
import BaseInertiaMiddleware from '@adonisjs/inertia/inertia_middleware'

export default class InertiaMiddleware extends BaseInertiaMiddleware {
  share(ctx: HttpContext) {
    // A page can render before the session and auth middleware ran (a 404, for example),
    // so these context properties may be missing.
    const { auth, request } = ctx as Partial<HttpContext>

    const theme: 'light' | 'dark' =
      request?.plainCookie('app_theme', {
        defaultValue: 'light',
        encoded: false,
      }) ?? 'light'

    return {
      errors: ctx.inertia.always(this.getValidationErrors(ctx)),
      user: ctx.inertia.always(auth?.user ? UserTransformer.transform(auth.user) : undefined),
      preferences: ctx.inertia.always({ theme }),
    }
  }

  // Flash messages go in the page's `flash` field, not in props, so the client can drop them
  // from history and they never reappear when navigating back.
  override flash(ctx: HttpContext) {
    const { session } = ctx as Partial<HttpContext>

    const success: string | undefined = session?.flashMessages.get('success')
    const error: string | undefined = session?.flashMessages.get('error')

    return { success, error }
  }

  async handle(ctx: HttpContext, next: NextFn) {
    await this.init(ctx)

    const output = await next()
    this.dispose(ctx)

    return output
  }
}

declare module '@adonisjs/inertia/types' {
  type MiddlewareSharedProps = InferSharedProps<InertiaMiddleware>
  export interface SharedProps extends MiddlewareSharedProps {}
}
