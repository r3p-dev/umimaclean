import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { enterAdminArea } from '#abilities/main'
import { ActivityAction } from '#enums/activity_enum'
import { MessageStatus } from '#enums/message_enum'
import ActivityLog from '#models/activity_log'
import Setting from '#models/setting'
import User from '#models/user'
import StaffAccountService from '#services/account/staff_account_service'
import { deliveryNote } from '#services/order_service'
import PaymentService from '#services/payment_service'
import ServiceAreaService from '#services/service_area_service'
import StaffAccountTransformer from '#transformers/staff_account_transformer'
import { saveStoreSettingsValidator } from '#validators/admin/settings'
import { saveStaffValidator, staffActiveValidator } from '#validators/admin/staff'

const PASSWORD_KEY = 'staff_password'

type PasswordNotice = { name: string; password: string; notice: string }

@inject()
export default class SettingsController {
  constructor(
    protected staffAccounts: StaffAccountService,
    protected area: ServiceAreaService,
    protected payments: PaymentService
  ) {}

  async staff({ auth, inertia, session }: HttpContext) {
    const accounts = await this.staffAccounts.list()
    const current = auth.getUserOrFail()
    return inertia.render('admin/settings/staff', {
      accounts: accounts.map((user) => new StaffAccountTransformer(user, current.id).toObject()),
      password: (session.flashMessages.get(PASSWORD_KEY) as PasswordNotice | undefined) ?? null,
    })
  }

  async storeStaff({ auth, bouncer, request, response, session }: HttpContext) {
    await bouncer.authorize(enterAdminArea)
    const payload = await request.validateUsing(saveStaffValidator)
    const result = await this.staffAccounts.create(auth.getUserOrFail(), payload)
    session.flash(PASSWORD_KEY, this.#notice(result.user.name, result.password, result.notice))
    return response.redirect().toRoute('admin.staff')
  }

  async updateStaff({ auth, bouncer, params, request, response, session }: HttpContext) {
    await bouncer.authorize(enterAdminArea)
    const user = await this.#account(params.id)
    const payload = await request.validateUsing(saveStaffValidator)
    await this.staffAccounts.update(auth.getUserOrFail(), user, payload)
    session.flash('success', `Akun ${payload.name} diperbarui.`)
    return response.redirect().toRoute('admin.staff')
  }

  async resetStaff({ auth, bouncer, params, response, session }: HttpContext) {
    await bouncer.authorize(enterAdminArea)
    const user = await this.#account(params.id)
    const result = await this.staffAccounts.resetPassword(auth.getUserOrFail(), user)
    session.flash(PASSWORD_KEY, this.#notice(user.name, result.password, result.notice))
    return response.redirect().toRoute('admin.staff')
  }

  async toggleStaff({ auth, bouncer, params, request, response, session }: HttpContext) {
    await bouncer.authorize(enterAdminArea)
    const user = await this.#account(params.id)
    const { active } = await request.validateUsing(staffActiveValidator)
    await this.staffAccounts.setActive(auth.getUserOrFail(), user, active)
    session.flash(
      'success',
      active
        ? `${user.name} diaktifkan lagi.`
        : `${user.name} dinonaktifkan dan sudah dikeluarkan dari semua perangkat.`
    )
    return response.redirect().toRoute('admin.staff')
  }

  async store({ inertia }: HttpContext) {
    const values = await Setting.values()
    return inertia.render('admin/settings/store', {
      settings: {
        name: values.store.name,
        whatsapp: values.store.whatsapp,
        address: values.store.address,
        hours: values.store.hours,
        areas: await this.area.coverage(),
        slots: values.pickup_slots,
        payments: values.payment_methods,
        inactiveDays: values.inactive_days,
      },
      isQrisAvailable: this.payments.isQrisAvailable(),
    })
  }

  async saveStore({ auth, bouncer, request, response, session }: HttpContext) {
    await bouncer.authorize(enterAdminArea)
    const owner = auth.getUserOrFail()
    const payload = await request.validateUsing(saveStoreSettingsValidator)
    await Setting.put('store', {
      name: payload.storeName,
      whatsapp: payload.whatsapp,
      address: payload.storeAddress,
      hours: payload.hours,
    })
    await Setting.put('pickup_slots', payload.slots)
    await Setting.put('payment_methods', payload.payments)
    await Setting.put('inactive_days', payload.inactiveDays)
    await this.area.save(owner, payload.areas)
    await ActivityLog.record({
      actor: owner,
      action: ActivityAction.SETTINGS_CHANGED,
      detail: `Profil toko, slot (${payload.slots.map((slot) => (slot.on ? slot.capacity : 'tutup')).join('/')}), metode bayar`,
    })
    session.flash('success', 'Pengaturan disimpan · tercatat di Aktivitas Staf.')
    return response.redirect().toRoute('admin.store')
  }

  #notice(name: string, password: string, notice: MessageStatus): PasswordNotice {
    return {
      name,
      password,
      notice:
        notice === MessageStatus.SENT
          ? `Kata sandi sementara juga dikirim ke WhatsApp ${name}.`
          : deliveryNote(notice, name),
    }
  }

  async #account(id: unknown) {
    return User.query()
      .where('id', Number(id) || 0)
      .whereIn('role', ['staff', 'admin'])
      .firstOrFail()
  }
}
