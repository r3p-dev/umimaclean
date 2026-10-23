import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import BaseInertiaMiddleware from '@adonisjs/inertia/inertia_middleware'
import { STAFF_ROLES } from '#enums/role_enum'
import TaskService from '#services/task_service'
import env from '#start/env'

export default class InertiaMiddleware extends BaseInertiaMiddleware {
  async share(ctx: HttpContext) {
    const { auth } = ctx as Partial<HttpContext>
    const { inertia, request } = ctx
    const user = auth?.user
    const isStaffPage =
      !!user && STAFF_ROLES.includes(user.role) && request.url().startsWith('/staf')

    return {
      errors: inertia.always(this.getValidationErrors(ctx)),
      isSignedIn: !!user,
      account: user
        ? {
            name: user.name,
            firstName: user.firstName(),
            role: user.role,
            roleLabel: user.roleLabel(),
          }
        : null,
      turnstileSiteKey: env.get('TURNSTILE_SITE_KEY'),
      staffCounts:
        isStaffPage && user
          ? await ctx.containerResolver.make(TaskService).then((tasks) => tasks.counts(user))
          : null,
    }
  }

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
