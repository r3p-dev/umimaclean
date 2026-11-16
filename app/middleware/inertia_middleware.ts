import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import UserTransformer from '#transformers/user_transformer'
import SettingService, {
  DEFAULT_STORE_SETTING,
  type StoreInfoSetting,
} from '#services/setting_service'
import BaseInertiaMiddleware from '@adonisjs/inertia/inertia_middleware'
import env from '#start/env'

export default class InertiaMiddleware extends BaseInertiaMiddleware {
  async share(ctx: HttpContext) {
    // A page can render before the auth and Shield middleware ran (a 404, for example), so these may be missing.
    const { auth, request } = ctx as Partial<HttpContext>

    const isTurnstileEnabled = env.get('TURNSTILE_ENABLED', true) !== false

    const settingService = await ctx.containerResolver.make(SettingService)
    let store: StoreInfoSetting = DEFAULT_STORE_SETTING
    try {
      store = await settingService.getStoreSettings()
    } catch {
      // fallback to defaults if database is not migrated yet
    }

    return {
      errors: ctx.inertia.always(this.getValidationErrors(ctx)),
      // Lets a form submitted before the page's scripts have loaded pass the CSRF check (CsrfField).
      csrfToken: ctx.inertia.always(request?.csrfToken),
      user: ctx.inertia.always(auth?.user ? UserTransformer.transform(auth.user) : undefined),
      turnstileSiteKey: isTurnstileEnabled ? env.get('TURNSTILE_SITE_KEY') : undefined,
      store: ctx.inertia.always(store),
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
