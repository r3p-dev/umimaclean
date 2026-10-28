import { inject } from '@adonisjs/core'
import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'
import { nationalNumber } from '#helpers/phone'
import CustomerAddressPolicy from '#policies/customer_address_policy'
import AddressService from '#services/address_service'
import AddressTransformer from '#transformers/address_transformer'
import { saveAddressValidator } from '#validators/customer/address'
import { MAX_ADDRESSES } from '#services/constants'

type Origin = 'order' | 'addresses'

@inject()
export default class AddressesController {
  constructor(protected addresses: AddressService) {}

  async index({ inertia, auth }: HttpContext) {
    const addresses = await this.addresses.listAddresses(auth.getUserOrFail())

    return inertia.render('customer/addresses/index', {
      addresses: addresses.map((address) => new AddressTransformer(address).toObject()),
      max: MAX_ADDRESSES,
    })
  }

  async create({ inertia, auth, request, response, session }: HttpContext) {
    const user = auth.getUserOrFail()

    const saved = await this.addresses.listAddresses(user)
    if (saved.length >= MAX_ADDRESSES) {
      session.flash('error', 'Maksimal 3 alamat tersimpan. Hapus salah satu dulu.')
      return response.redirect().toRoute('customer.addresses.index')
    }

    return inertia.render('customer/addresses/form', {
      address: null,
      origin: this.#originOf(request.qs().dari),
      recipientName: user.name,
      recipientPhone: nationalNumber(user.phone),
      isFirstAddress: saved.length === 0,
    })
  }

  async store({ auth, request, response, session }: HttpContext) {
    const payload = await request.validateUsing(saveAddressValidator)

    await this.addresses.createAddress(auth.getUserOrFail(), payload)

    session.flash('success', 'Alamat disimpan.')
    return this.#originOf(request.qs().dari) === 'order'
      ? response.redirect().clearQs().toRoute('customer.order.create')
      : response.redirect().toRoute('customer.addresses.index')
  }

  async edit({ auth, bouncer, inertia, params }: HttpContext) {
    const user = auth.getUserOrFail()
    const address = await this.#owned(bouncer, params.id)

    return inertia.render('customer/addresses/form', {
      address: new AddressTransformer(address).toObject(),
      origin: 'addresses' as Origin,
      recipientName: user.name,
      recipientPhone: nationalNumber(user.phone),
      isFirstAddress: false,
    })
  }

  async update({ bouncer, params, request, response, session }: HttpContext) {
    const address = await this.#owned(bouncer, params.id)
    const payload = await request.validateUsing(saveAddressValidator)

    await this.addresses.updateAddress(address, payload)

    session.flash('success', 'Perubahan alamat disimpan.')
    return response.redirect().toRoute('customer.addresses.index')
  }

  async makePrimary({ bouncer, params, response, session }: HttpContext) {
    const address = await this.#owned(bouncer, params.id)
    await this.addresses.makeAddressPrimary(address)

    session.flash('success', `${address.label} jadi alamat utama.`)
    return response.redirect().toRoute('customer.addresses.index')
  }

  async destroy({ bouncer, params, response, session }: HttpContext) {
    const address = await this.#owned(bouncer, params.id)
    await this.addresses.deleteAddress(address)

    session.flash('success', 'Alamat dihapus.')
    return response.redirect().toRoute('customer.addresses.index')
  }

  async #owned(bouncer: HttpContext['bouncer'], id: unknown) {
    const address = await this.addresses.findAddressById(Number(id) || 0)
    if (!address || !(await bouncer.with(CustomerAddressPolicy).allows('manage', address))) {
      throw new Exception('Alamat tidak ditemukan', { status: 404 })
    }

    return address
  }

  #originOf(value: unknown): Origin {
    return value === 'pesan' ? 'order' : 'addresses'
  }
}
