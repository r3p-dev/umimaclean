import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import CustomerAddress, { MAX_ADDRESSES } from '#models/customer_address'
import ServiceArea, { type Point } from '#models/service_area'
import User from '#models/user'
import type { AddressInput } from '#validators/customer/address'
import { fieldError } from '#validators/shared/field_error'

export default class AddressService {
  list(user: User, transaction?: TransactionClientContract) {
    return CustomerAddress.query({ client: transaction })
      .where('user_id', user.id)
      .withScopes((scopes) => scopes.primaryFirst())
  }

  find(user: User, id: number, transaction?: TransactionClientContract) {
    return CustomerAddress.query({ client: transaction })
      .where('user_id', user.id)
      .where('id', id)
      .first()
  }

  primary(user: User) {
    return this.list(user).where('is_primary', true).first()
  }

  async #assertServiceable(point: Point) {
    if (!(await ServiceArea.contains(point))) {
      throw fieldError('point', 'Titik jemput di luar area antar-jemput gratis.', 'area.outside')
    }
  }

  async create(user: User, input: AddressInput) {
    await this.#assertServiceable(input.point)
    return db.transaction(async (transaction) => {
      await this.#lockOwner(user, transaction)

      const count = await CustomerAddress.countFor(user, transaction)
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

  async update(address: CustomerAddress, input: AddressInput) {
    await this.#assertServiceable(input.point)
    return db.transaction(async (transaction) => {
      address.useTransaction(transaction)
      const owner = await this.#lockOwner(address.userId, transaction)

      if (input.isPrimary && !address.isPrimary) {
        await this.#clearPrimary(owner, transaction)
        address.isPrimary = true
      }

      address.merge(this.#columns(input))
      await address.save()

      return address
    })
  }

  async makePrimary(address: CustomerAddress) {
    if (address.isPrimary) {
      return
    }

    await db.transaction(async (transaction) => {
      address.useTransaction(transaction)
      const owner = await this.#lockOwner(address.userId, transaction)

      await this.#clearPrimary(owner, transaction)
      address.isPrimary = true
      await address.save()
    })
  }

  async remove(address: CustomerAddress) {
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
