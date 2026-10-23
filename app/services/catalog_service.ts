import { inject } from '@adonisjs/core'
import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { DateTime } from 'luxon'
import { ActivityAction } from '#enums/activity_enum'
import { ItemKind } from '#enums/order_enum'
import { ServiceType } from '#enums/service_enum'
import Service from '#models/service'
import type User from '#models/user'
import ActivityService from '#services/activity_service'
import { formatRupiah } from '#services/notification_service'
import { fieldError } from '#validators/shared/field_error'

export type ServiceInput = {
  serviceName: string
  type: 'utama' | 'tambahan'
  categories: ('Sepatu' | 'Tas' | 'Helm')[]
  price: number
  days: number
  description?: string
  active: boolean
}

const KIND_OF = { Sepatu: ItemKind.SHOE, Tas: ItemKind.BAG, Helm: ItemKind.HELMET } as const

export type ItemSelection = { main: number; addons: number[] }

@inject()
export default class CatalogService {
  constructor(protected activity: ActivityService) {}

  list() {
    return Service.query().withScopes((scopes) => {
      scopes.available()
      scopes.ordered()
    })
  }

  active() {
    return this.list().where('is_active', true)
  }

  async resolve(
    kind: ItemKind,
    selection: ItemSelection,
    field: string,
    transaction?: TransactionClientContract
  ) {
    const ids = [selection.main, ...new Set(selection.addons)]
    const services = await Service.query({ client: transaction })
      .whereIn('id', ids)
      .whereNull('deleted_at')
      .where('is_active', true)
    const byId = new Map(services.map((service) => [service.id, service]))

    const main = byId.get(selection.main)
    if (!main || main.type !== ServiceType.MAIN || !main.categories.includes(kind)) {
      throw fieldError(field, 'Pilih layanan utama yang tersedia.', 'service.main')
    }

    const addons = [...new Set(selection.addons)].map((id) => byId.get(id))
    if (
      addons.some(
        (addon) => !addon || addon.type !== ServiceType.ADDON || !addon.categories.includes(kind)
      )
    ) {
      throw fieldError(
        field,
        'Layanan tambahan tidak tersedia. Muat ulang halaman.',
        'service.addon'
      )
    }

    return [main, ...(addons as Service[])]
  }

  async save(owner: User, input: ServiceInput, id: number | null) {
    return db.transaction(async (transaction) => {
      const service = id
        ? await Service.query({ client: transaction })
            .where('id', id)
            .whereNull('deleted_at')
            .forUpdate()
            .firstOrFail()
        : new Service()
      const before = service.$isPersisted ? `${service.name} ${formatRupiah(service.price)}` : null
      service.useTransaction(transaction)
      service.merge({
        name: input.serviceName,
        type: input.type === 'utama' ? ServiceType.MAIN : ServiceType.ADDON,
        categories: input.categories.map((category) => KIND_OF[category]),
        price: input.price,
        days: input.days,
        description: input.description ?? '',
        isActive: input.active,
      })
      await service.save()
      await this.activity.record(
        {
          actor: owner,
          action: ActivityAction.PRICE_CHANGED,
          detail: before
            ? `${before} → ${service.name} ${formatRupiah(service.price)}`
            : `Menambah ${service.name} ${formatRupiah(service.price)}`,
          isSensitive: !!before,
        },
        transaction
      )
      return service
    })
  }

  async setActive(owner: User, ids: number[], isActive: boolean) {
    const services = await Service.query().whereIn('id', ids).whereNull('deleted_at')
    await Service.query().whereIn('id', ids).update({ is_active: isActive })
    await this.activity.record({
      actor: owner,
      action: ActivityAction.PRICE_CHANGED,
      detail: `${isActive ? 'Mengaktifkan' : 'Menonaktifkan'} ${services.map((service) => service.name).join(', ')}`,
    })
    return services.length
  }

  async remove(owner: User, ids: number[]) {
    const services = await Service.query().whereIn('id', ids).whereNull('deleted_at')
    await Service.query()
      .whereIn('id', ids)
      .update({ deleted_at: DateTime.now().toJSDate(), is_active: false })
    await this.activity.record({
      actor: owner,
      action: ActivityAction.PRICE_CHANGED,
      detail: `Menghapus ${services.map((service) => service.name).join(', ')}`,
      isSensitive: true,
    })
    return services.length
  }
}
