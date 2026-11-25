import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { mapTiles } from '#helpers/map'
import { MAX_ADDRESSES } from '#models/customer_address'
import AddressService, { TOO_MANY_ADDRESSES_MESSAGE } from '#services/address_service'
import AreaService from '#services/area_service'
import AddressTransformer from '#transformers/address_transformer'
import ServiceAreaShapeTransformer from '#transformers/service_area_shape_transformer'
import { createAddressValidator, updateAddressValidator } from '#validators/address_validator'

// CUST-14: the customer's address pages; every action is scoped to the signed-in customer.
@inject()
export default class AddressesController {
  constructor(
    protected addressService: AddressService,
    protected areaService: AreaService
  ) {}

  async index({ auth, inertia }: HttpContext) {
    const addresses = await this.addressService.listAddresses(auth.getUserOrFail())
    return inertia.render('customer/addresses/index', {
      addresses: AddressTransformer.transform(addresses),
      maxAddresses: MAX_ADDRESSES,
    })
  }

  async create({ auth, inertia, request, response, session }: HttpContext) {
    const count = await this.addressService.countAddresses(auth.getUserOrFail())
    if (count >= MAX_ADDRESSES) {
      session.flash('error', TOO_MANY_ADDRESSES_MESSAGE)
      return response.redirect().toRoute('customer.addresses.index')
    }
    return inertia.render('customer/addresses/form', {
      address: null,
      isFirstAddress: count === 0,
      returnTo: request.qs().dari === 'pesan' ? 'pesan' : null,
      ...(await this.#mapProps()),
    })
  }

  async store({ auth, request, response, session }: HttpContext) {
    const payload = await request.validateUsing(createAddressValidator)
    await this.addressService.createAddress(auth.getUserOrFail(), payload)

    session.flash('success', 'Alamat disimpan.')
    if (request.input('returnTo') === 'pesan') {
      return response.redirect().toRoute('customer.orders.create')
    }
    return response.redirect().toRoute('customer.addresses.index')
  }

  async edit({ auth, inertia, params }: HttpContext) {
    const address = await this.addressService.findAddressOf(auth.getUserOrFail(), params.id)
    return inertia.render('customer/addresses/form', {
      address: AddressTransformer.transform(address),
      isFirstAddress: false,
      returnTo: null,
      ...(await this.#mapProps()),
    })
  }

  async update({ auth, params, request, response, session }: HttpContext) {
    const payload = await request.validateUsing(updateAddressValidator)
    await this.addressService.updateAddress(auth.getUserOrFail(), params.id, payload)

    session.flash('success', 'Alamat diperbarui.')
    return response.redirect().toRoute('customer.addresses.index')
  }

  async makePrimary({ auth, params, response, session }: HttpContext) {
    const address = await this.addressService.makeAddressPrimary(auth.getUserOrFail(), params.id)

    session.flash('success', `${address.label} jadi alamat utama.`)
    return response.redirect().toRoute('customer.addresses.index')
  }

  async destroy({ auth, params, response, session }: HttpContext) {
    const address = await this.addressService.deleteAddress(auth.getUserOrFail(), params.id)

    session.flash('success', `Alamat ${address.label} dihapus.`)
    return response.redirect().toRoute('customer.addresses.index')
  }

  // The form's map shows only the districts a pin may be saved in.
  async #mapProps() {
    const shapes = await this.areaService.getAreaShapes()
    return {
      shapes: ServiceAreaShapeTransformer.transform(shapes.filter((area) => area.isActive)),
      ...mapTiles(),
    }
  }
}
