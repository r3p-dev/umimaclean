import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import AddressNotFoundException from '#exceptions/address_not_found_exception'
import CustomerAddress, { MAX_ACTIVE_ADDRESSES } from '#models/customer_address'
import CustomerAddressPolicy from '#policies/customer_address_policy'
import AddressBookService from '#services/address_book_service'
import ServiceAreaService from '#services/service_area_service'
import AddressTransformer from '#transformers/address_transformer'
import { saveAddressValidator } from '#validators/customer/address'

type Origin = 'order' | 'addresses'

@inject()
export default class AddressesController {
  constructor(
    protected addresses: AddressBookService,
    protected area: ServiceAreaService
  ) {}

  async index({ inertia, auth }: HttpContext) {
    const addresses = await this.addresses.list(auth.getUserOrFail())

    return inertia.render('customer/addresses/index', {
      addresses: addresses.map((address) => new AddressTransformer(address).toObject()),
      max: MAX_ACTIVE_ADDRESSES,
    })
  }

  async create({ inertia, auth, request, response, session }: HttpContext) {
    const user = auth.getUserOrFail()

    const saved = await this.addresses.list(user)
    if (saved.length >= MAX_ACTIVE_ADDRESSES) {
      session.flash(
        'error',
        `Maksimal ${MAX_ACTIVE_ADDRESSES} alamat tersimpan. Hapus salah satu dulu.`
      )
      return response.redirect().toRoute('customer.addresses.index')
    }

    return inertia.render('customer/addresses/form', {
      address: null,
      origin: this.#originOf(request.qs().dari),
      recipientName: user.name,
      isFirstAddress: saved.length === 0,
      coverage: await this.area.coverage(),
    })
  }

  async store({ auth, request, response, session }: HttpContext) {
    const payload = await request.validateUsing(saveAddressValidator)

    await this.addresses.assertServiceable(payload.point)
    await this.addresses.create(auth.getUserOrFail(), payload)

    session.flash('success', 'Alamat disimpan.')
    return this.#originOf(request.qs().dari) === 'order'
      ? response.redirect().clearQs().toRoute('customer.order.create')
      : response.redirect().toRoute('customer.addresses.index')
  }

  async edit({ auth, bouncer, inertia, params }: HttpContext) {
    const address = await this.#owned(bouncer, params.id)

    return inertia.render('customer/addresses/form', {
      address: new AddressTransformer(address).toObject(),
      origin: 'addresses' as Origin,
      recipientName: auth.getUserOrFail().name,
      isFirstAddress: false,
      coverage: await this.area.coverage(),
    })
  }

  async update({ bouncer, params, request, response, session }: HttpContext) {
    const address = await this.#owned(bouncer, params.id)
    const payload = await request.validateUsing(saveAddressValidator)

    await this.addresses.assertServiceable(payload.point)
    await this.addresses.update(address, payload)

    session.flash('success', 'Perubahan alamat disimpan.')
    return response.redirect().toRoute('customer.addresses.index')
  }

  async makePrimary({ bouncer, params, response, session }: HttpContext) {
    const address = await this.#owned(bouncer, params.id)
    await this.addresses.makePrimary(address)
    session.flash('success', `${address.label} jadi alamat utama.`)
    return response.redirect().toRoute('customer.addresses.index')
  }

  async destroy({ bouncer, params, response, session }: HttpContext) {
    const address = await this.#owned(bouncer, params.id)
    await this.addresses.remove(address)

    session.flash('success', 'Alamat dihapus.')
    return response.redirect().toRoute('customer.addresses.index')
  }

  async #owned(bouncer: HttpContext['bouncer'], id: unknown) {
    const address = await CustomerAddress.find(Number(id) || 0)
    if (!address || !(await bouncer.with(CustomerAddressPolicy).allows('manage', address))) {
      throw new AddressNotFoundException()
    }

    return address
  }

  #originOf(value: unknown): Origin {
    return value === 'pesan' ? 'order' : 'addresses'
  }
}
