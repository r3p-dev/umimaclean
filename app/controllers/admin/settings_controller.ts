import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { enterAdminArea } from '#abilities/main'
import AreaService from '#services/area_service'
import PaymentService from '#services/payment_service'
import SettingService from '#services/setting_service'
import StaffService from '#services/staff_service'
import ServiceAreaTransformer from '#transformers/service_area_transformer'
import StaffAccountTransformer from '#transformers/staff_account_transformer'
import {
  saveStoreSettingsValidator,
  searchAreasValidator,
  toggleAreaValidator,
} from '#validators/admin/settings'
import { saveStaffValidator, staffActiveValidator } from '#validators/admin/staff'

const PASSWORD_KEY = 'staff_password'

type PasswordNotice = { name: string; password: string; notice: string }

@inject()
export default class SettingsController {
  constructor(
    protected staffAccounts: StaffService,
    protected area: AreaService,
    protected payments: PaymentService,
    protected settings: SettingService
  ) {}

  async staff({ auth, inertia, session }: HttpContext) {
    const accounts = await this.staffAccounts.listStaff()
    const current = auth.getUserOrFail()
    return inertia.render('admin/settings/staff', {
      accounts: accounts.map((user) => new StaffAccountTransformer(user, current.id).toObject()),
      password: (session.flashMessages.get(PASSWORD_KEY) as PasswordNotice | undefined) ?? null,
    })
  }

  async storeStaff({ auth, bouncer, request, response, session }: HttpContext) {
    await bouncer.authorize(enterAdminArea)
    const payload = await request.validateUsing(saveStaffValidator)
    const result = await this.staffAccounts.createStaff(auth.getUserOrFail(), payload)
    session.flash(PASSWORD_KEY, this.#notice(result.user.name, result.password))
    return response.redirect().toRoute('admin.staff')
  }

  async updateStaff({ auth, bouncer, params, request, response, session }: HttpContext) {
    await bouncer.authorize(enterAdminArea)
    const user = await this.#account(params.id)
    const payload = await request.validateUsing(saveStaffValidator)
    await this.staffAccounts.updateStaff(auth.getUserOrFail(), user, payload)
    session.flash('success', `Akun ${payload.name} diperbarui.`)
    return response.redirect().toRoute('admin.staff')
  }

  async resetStaff({ auth, bouncer, params, response, session }: HttpContext) {
    await bouncer.authorize(enterAdminArea)
    const user = await this.#account(params.id)
    const result = await this.staffAccounts.resetStaffPassword(auth.getUserOrFail(), user)
    session.flash(PASSWORD_KEY, this.#notice(user.name, result.password))
    return response.redirect().toRoute('admin.staff')
  }

  async toggleStaff({ auth, bouncer, params, request, response, session }: HttpContext) {
    await bouncer.authorize(enterAdminArea)
    const user = await this.#account(params.id)
    const { active } = await request.validateUsing(staffActiveValidator)
    await this.staffAccounts.setStaffActive(auth.getUserOrFail(), user, active)
    session.flash(
      'success',
      active
        ? `${user.name} diaktifkan lagi.`
        : `${user.name} dinonaktifkan dan sudah dikeluarkan dari semua perangkat.`
    )
    return response.redirect().toRoute('admin.staff')
  }

  async store({ inertia }: HttpContext) {
    const values = await this.settings.allSettings()
    return inertia.render('admin/settings/store', {
      settings: {
        name: values.store.name,
        whatsapp: values.store.whatsapp,
        address: values.store.address,
        hours: values.store.hours,
        slots: values.pickup_slots,
        payments: values.payment_methods,
        inactiveDays: values.inactive_days,
      },
      isQrisAvailable: this.payments.isQrisAvailable(),
    })
  }

  async saveStore({ auth, bouncer, request, response, session }: HttpContext) {
    await bouncer.authorize(enterAdminArea)
    const payload = await request.validateUsing(saveStoreSettingsValidator)
    await this.settings.saveStoreSettings(auth.getUserOrFail(), payload)
    session.flash('success', 'Pengaturan disimpan · tercatat di Aktivitas Staf.')
    return response.redirect().toRoute('admin.store')
  }

  async areas({ inertia, request }: HttpContext) {
    const { q } = await request.validateUsing(searchAreasValidator, { data: request.qs() })
    const query = q ?? ''
    const { active, results } = await this.area.listAreasForOwner(query)
    return inertia.render('admin/settings/areas', {
      q: query,
      active: active.map((area) => new ServiceAreaTransformer(area).toObject()),
      results: results.map((area) => new ServiceAreaTransformer(area).toObject()),
    })
  }

  async toggleArea({ auth, bouncer, params, request, response, session }: HttpContext) {
    await bouncer.authorize(enterAdminArea)
    const { isActive } = await request.validateUsing(toggleAreaValidator)
    const area = await this.area.setAreaActive(auth.getUserOrFail(), params.id, isActive)
    session.flash(
      'success',
      isActive
        ? `Kec. ${area.name} masuk area layanan.`
        : `Kec. ${area.name} dikeluarkan dari area layanan. Pesanan yang sudah berjalan tidak berubah.`
    )
    return response.redirect().back()
  }

  #notice(name: string, password: string): PasswordNotice {
    return {
      name,
      password,
      notice: `Berikan kata sandi ini langsung ke ${name}. Kata sandi hanya tampil sekali.`,
    }
  }

  async #account(id: unknown) {
    return this.staffAccounts.findStaffAccount(Number(id) || 0)
  }
}
