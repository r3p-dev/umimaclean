import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { enterAdminArea, enterCustomerArea, enterStaffArea } from '#abilities/main'
import { LoginRedirect } from '#enums/role_enum'

const AREAS = {
  customer: enterCustomerArea,
  staff: enterStaffArea,
  admin: enterAdminArea,
}

export type Area = keyof typeof AREAS

export default class AreaMiddleware {
  async handle({ auth, bouncer, response, session }: HttpContext, next: NextFn, area: Area) {
    const user = auth.getUserOrFail()
    if (!user.isActive) {
      await auth.use('web').logout()
      session.flash('error', 'Akun Anda dinonaktifkan. Hubungi owner.')
      return response.redirect().toRoute('auth.staff_login')
    }

    if (await bouncer.denies(AREAS[area])) {
      session.flash('error', 'Anda tidak memiliki akses ke halaman ini.')
      return response.redirect().toRoute(LoginRedirect[user.role])
    }

    return next()
  }
}
