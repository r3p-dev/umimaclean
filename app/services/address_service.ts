import { inject } from '@adonisjs/core'
import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { fieldError } from '#helpers/validation'
import CustomerAddress, { MAX_ADDRESSES } from '#models/customer_address'
import User from '#models/user'
import AreaService from '#services/area_service'
import PlaceService from '#services/place_service'
import type { AddressInput } from '#validators/address_validator'

export const OUTSIDE_AREA_MESSAGE =
  'Titik ini di luar area layanan. Geser peta ke alamat di area antar-jemput gratis.'
export const TOO_MANY_ADDRESSES_MESSAGE = `Maksimal ${MAX_ADDRESSES} alamat tersimpan. Hapus salah satu dulu.`

// A customer's saved addresses (CUST-2, CUST-3). Every change locks the customer's row first, so two
// requests at once can neither pass the limit of 3 together nor both change the primary address.
@inject()
export default class AddressService {
  constructor(
    protected areaService: AreaService,
    protected placeService: PlaceService
  ) {}

  async listAddresses(user: User): Promise<CustomerAddress[]> {
    return CustomerAddress.query()
      .where('user_id', user.id)
      .withScopes((scopes) => {
        scopes.withCoverage()
        scopes.primaryFirst()
      })
  }

  // Another customer's address answers 404, as if it did not exist.
  async findAddressOf(user: User, id: number, client?: TransactionClientContract) {
    return CustomerAddress.query({ client }).where('user_id', user.id).where('id', id).firstOrFail()
  }

  async countAddresses(user: User) {
    const row = await CustomerAddress.query()
      .where('user_id', user.id)
      .count('* as total')
      .firstOrFail()
    return Number(row.$extras.total)
  }

  async createAddress(user: User, input: AddressInput) {
    const location = await this.#resolveLocation(input)

    return db.transaction(async (transaction) => {
      await this.#lockCustomer(user, transaction)
      const count = await CustomerAddress.query({ client: transaction })
        .where('user_id', user.id)
        .count('* as total')
        .firstOrFail()
      const existing = Number(count.$extras.total)
      if (existing >= MAX_ADDRESSES) {
        fieldError('label', TOO_MANY_ADDRESSES_MESSAGE, 'addresses.max')
      }

      // The first address is always primary (CUST-2).
      const isPrimary = existing === 0 || input.isPrimary === true
      if (isPrimary) {
        await this.#clearPrimary(user, transaction)
      }
      return CustomerAddress.create(
        { userId: user.id, isPrimary, ...this.#columns(input), ...location },
        { client: transaction }
      )
    })
  }

  async updateAddress(user: User, id: number, input: AddressInput) {
    const location = await this.#resolveLocation(input)

    return db.transaction(async (transaction) => {
      await this.#lockCustomer(user, transaction)
      const address = await this.findAddressOf(user, id, transaction)
      // Unticking "primary" is ignored: one address always stays primary; another is chosen instead.
      if (input.isPrimary && !address.isPrimary) {
        await this.#clearPrimary(user, transaction)
        address.isPrimary = true
      }
      await address.merge({ ...this.#columns(input), ...location }).save()
      return address
    })
  }

  async makeAddressPrimary(user: User, id: number) {
    return db.transaction(async (transaction) => {
      await this.#lockCustomer(user, transaction)
      const address = await this.findAddressOf(user, id, transaction)
      if (!address.isPrimary) {
        await this.#clearPrimary(user, transaction)
        await address.merge({ isPrimary: true }).save()
      }
      return address
    })
  }

  // Deleting the primary address promotes the newest remaining one (CUST-2).
  async deleteAddress(user: User, id: number) {
    return db.transaction(async (transaction) => {
      await this.#lockCustomer(user, transaction)
      const address = await this.findAddressOf(user, id, transaction)
      await address.delete()
      if (!address.isPrimary) {
        return address
      }

      const newest = await CustomerAddress.query({ client: transaction })
        .where('user_id', user.id)
        .orderBy('created_at', 'desc')
        .orderBy('id', 'desc')
        .first()
      if (newest) {
        await newest.merge({ isPrimary: true }).save()
      }
      return address
    })
  }

  // Saving is checked on the server whatever the map showed (AREA-4). The area fields come from the
  // pin, never from the form, so the detail the customer typed is never replaced (D109).
  async #resolveLocation(input: AddressInput) {
    const { isCovered, district } = await this.areaService.checkCoverage(input.lat, input.lng)
    if (!isCovered || !district) {
      fieldError('lat', OUTSIDE_AREA_MESSAGE, 'area.outside')
    }
    const label = await this.placeService.describePoint(input)
    return {
      street: label?.street ?? null,
      kelurahan: label?.kelurahan ?? null,
      kecamatan: district.name,
      city: district.city,
    }
  }

  async #lockCustomer(user: User, transaction: TransactionClientContract) {
    await User.query({ client: transaction }).where('id', user.id).forUpdate().firstOrFail()
  }

  async #clearPrimary(user: User, transaction: TransactionClientContract) {
    await CustomerAddress.query({ client: transaction })
      .where('user_id', user.id)
      .where('is_primary', true)
      .update({ is_primary: false })
  }

  #columns(input: AddressInput) {
    return {
      label: input.label,
      recipientName: input.recipientName,
      recipientPhone: input.recipientPhone,
      addressText: input.addressText,
      details: input.details || null,
      lat: input.lat,
      lng: input.lng,
    }
  }
}
