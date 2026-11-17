import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import UserTransformer from '#transformers/user_transformer'
import { DateTime } from 'luxon'
import SettingService, {
  DEFAULT_OPENING_HOURS,
  DEFAULT_STORE_SETTING,
  type StoreInfoSetting,
} from '#services/setting_service'
import { openingStatus, weeklyHours } from '#helpers/opening_hours'
import BaseInertiaMiddleware from '@adonisjs/inertia/inertia_middleware'
import env from '#start/env'
import app from '@adonisjs/core/services/app'
import logger from '@adonisjs/core/services/logger'

export default class InertiaMiddleware extends BaseInertiaMiddleware {
  async share(ctx: HttpContext) {
    // A page can render before the auth and Shield middleware ran (a 404, for example), so these may be missing.
    const { auth, request } = ctx as Partial<HttpContext>

    const isTurnstileEnabled = env.get('TURNSTILE_ENABLED', true) !== false

    const settingService = await ctx.containerResolver.make(SettingService)
    let store: StoreInfoSetting = DEFAULT_STORE_SETTING
    let hours = DEFAULT_OPENING_HOURS
    try {
      store = await settingService.getStoreSettings()
      hours = await settingService.getOpeningHours()
    } catch (error) {
      // Production still renders the page with the defaults; dev and test fail loudly.
      logger.error({ err: error }, 'Store settings could not be read for the shared page props')
      if (!app.inProduction) {
        throw error
      }
    }

    return {
      errors: ctx.inertia.always(this.getValidationErrors(ctx)),
      // Lets a form submitted before the page's scripts have loaded pass the CSRF check (CsrfField).
      csrfToken: ctx.inertia.always(request?.csrfToken),
      user: ctx.inertia.always(auth?.user ? UserTransformer.transform(auth.user) : undefined),
      turnstileSiteKey: isTurnstileEnabled ? env.get('TURNSTILE_SITE_KEY') : undefined,
      store: ctx.inertia.always(store),
      openingHours: ctx.inertia.always({
        status: openingStatus(hours, DateTime.now()),
        weekly: weeklyHours(hours),
      }),
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
