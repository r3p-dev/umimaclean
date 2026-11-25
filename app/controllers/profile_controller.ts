import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { profileArea, profileRoute } from '#helpers/profile_route'
import CustomerAddress from '#models/customer_address'
import AccountService from '#services/account_service'
import { updateProfileValidator } from '#validators/profile_validator'

// The Profil pages of every role share these actions; only the page and its layout differ (D108).
const PAGES = {
  customer: { show: 'customer/profile/show', edit: 'customer/profile/edit' },
  staff: { show: 'staff/profile', edit: 'staff/profile_edit' },
  admin: { show: 'admin/profile', edit: 'admin/profile_edit' },
} as const

@inject()
export default class ProfileController {
  constructor(protected accountService: AccountService) {}

  async show(ctx: HttpContext) {
    const area = profileArea(ctx)
    if (area === 'customer') {
      const addresses = await CustomerAddress.query()
        .where('user_id', ctx.auth.getUserOrFail().id)
        .select('label', 'is_primary')
      const primary = addresses.find((address) => address.isPrimary)
      return ctx.inertia.render(PAGES.customer.show, {
        addressCount: addresses.length,
        primaryLabel: primary?.label ?? null,
      })
    }
    return ctx.inertia.render(PAGES[area].show, {})
  }

  async edit(ctx: HttpContext) {
    return ctx.inertia.render(PAGES[profileArea(ctx)].edit, {})
  }

  async update(ctx: HttpContext) {
    const payload = await ctx.request.validateUsing(updateProfileValidator)
    await this.accountService.changeName(ctx.auth.getUserOrFail(), payload.name)

    ctx.session.flash('success', 'Nama diperbarui.')
    return ctx.response.redirect().toRoute(profileRoute(profileArea(ctx)))
  }
}
