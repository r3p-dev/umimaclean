import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import CustomerAddress from '#models/customer_address'
import User from '#models/user'
import type { AddressInput } from '#validators/customer/address'
import { fieldError } from '#validators/shared/field_error'
import ServiceArea, { type Point } from '#models/service_area'
import { MAX_ADDRESSES } from '#services/constants'

export default class AddressService {
  listAddresses(user: User, transaction?: TransactionClientContract) {
    return CustomerAddress.query({ client: transaction })
      .where('user_id', user.id)
      .withScopes((scopes) => scopes.primaryFirst())
  }

  findAddressById(id: number) {
    return CustomerAddress.find(id)
  }

  findAddress(user: User, id: number, transaction?: TransactionClientContract) {
    return CustomerAddress.query({ client: transaction })
      .where('user_id', user.id)
      .where('id', id)
      .first()
  }

  async createAddress(user: User, input: AddressInput) {
    await this.#assertServiceable(input.point)

    return db.transaction(async (transaction) => {
      await this.#lockOwner(user, transaction)

      const count = await CustomerAddress.countForUser(user, transaction)
      if (count >= MAX_ADDRESSES) {
        throw fieldError(
          'addressText',
          'Maksimal 3 alamat tersimpan. Hapus salah satu dulu.',
          'addresses.max'
        )
      }

      const isPrimary = count === 0 || input.isPrimary === true
      if (isPrimary) {
        await this.#clearPrimary(user, transaction)
      }

      return CustomerAddress.create(
        { userId: user.id, isPrimary, ...this.#columns(input) },
        { client: transaction }
      )
    })
  }

  async updateAddress(address: CustomerAddress, input: AddressInput) {
    await this.#assertServiceable(input.point)

    return db.transaction(async (transaction) => {
      address.useTransaction(transaction)
      const owner = await this.#lockOwner(address.userId, transaction)

      if (input.isPrimary && !address.isPrimary) {
        await this.#clearPrimary(owner, transaction)
        address.isPrimary = true
      }

      await address.merge(this.#columns(input)).save()

      return address
    })
  }

  async makeAddressPrimary(address: CustomerAddress) {
    if (address.isPrimary) {
      return
    }

    await db.transaction(async (transaction) => {
      address.useTransaction(transaction)
      const owner = await this.#lockOwner(address.userId, transaction)

      await this.#clearPrimary(owner, transaction)
      await address.merge({ isPrimary: true }).save()
    })
  }

  async deleteAddress(address: CustomerAddress) {
    await db.transaction(async (transaction) => {
      address.useTransaction(transaction)
      const owner = await this.#lockOwner(address.userId, transaction)

      const wasPrimary = address.isPrimary
      await address.delete()

      if (!wasPrimary) {
        return
      }

      const next = await CustomerAddress.query({ client: transaction })
        .where('user_id', owner.id)
        .orderBy('id', 'desc')
        .first()
      if (next) {
        next.isPrimary = true
        await next.save()
      }
    })
  }

  async #assertServiceable(point: Point) {
    if (!(await ServiceArea.contains(point))) {
      throw fieldError('point', 'Titik jemput di luar area antar-jemput gratis.', 'area.outside')
    }
  }

  #lockOwner(user: User | number, transaction: TransactionClientContract) {
    return User.query({ client: transaction })
      .where('id', typeof user === 'number' ? user : user.id)
      .forUpdate()
      .firstOrFail()
  }

  #clearPrimary(user: User, transaction: TransactionClientContract) {
    return CustomerAddress.query({ client: transaction })
      .where('user_id', user.id)
      .where('is_primary', true)
      .update({ is_primary: false })
  }

  #columns(input: AddressInput) {
    return {
      label: input.label,
      recipientName: input.recipientName,
      addressText: input.addressText,
      landmark: input.landmark || null,
      lat: input.point.lat,
      lng: input.point.lng,
    }
  }
}
