import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import AccountService from '#services/account/account_service'
import AccountSessionService from '#services/account/account_session_service'
import AddressBookService from '#services/address_book_service'
import UserTransformer from '#transformers/user_transformer'
import { updateProfileValidator } from '#validators/customer/profile'

@inject()
export default class ProfileController {
  constructor(
    protected addresses: AddressBookService,
    protected accounts: AccountService,
    protected sessions: AccountSessionService
  ) {}

  async show({ inertia, auth }: HttpContext) {
    const user = auth.getUserOrFail()

    const [addresses, deviceCount] = await Promise.all([
      this.addresses.list(user),
      this.sessions.activeDeviceCount(user),
    ])

    return inertia.render('customer/profile/show', {
      user: new UserTransformer(user).toObject(),
      addressCount: addresses.length,
      primaryLabel: addresses.find((address) => address.isPrimary)?.label ?? null,
      deviceCount,
    })
  }

  async edit({ inertia, auth }: HttpContext) {
    return inertia.render('customer/profile/edit', {
      user: new UserTransformer(auth.getUserOrFail()).toObject(),
    })
  }

  async update({ auth, request, response, session }: HttpContext) {
    const { name } = await request.validateUsing(updateProfileValidator)

    await this.accounts.updateProfile(auth.getUserOrFail(), { name })

    session.flash('success', 'Profil disimpan.')
    return response.redirect().toRoute('customer.profile.edit')
  }
}
