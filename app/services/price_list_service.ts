import { inject } from '@adonisjs/core'
import { Exception } from '@adonisjs/core/exceptions'
import { DateTime } from 'luxon'
import ActivityLog from '#models/activity_log'
import Service from '#models/service'
import type User from '#models/user'
import type { ItemKind } from '#enums/item_kind_enum'
import type { ServiceType } from '#enums/service_type_enum'
import { formatRupiah } from '#helpers/money'

export interface ServiceData {
  name: string
  type: ServiceType
  itemKinds: ItemKind[]
  price: number
  estimatedDays: number
  isStartingFrom: boolean
  description: string
  isActive?: boolean
  displayOrder?: number
}

@inject()
export default class PriceListService {
  async getActiveServices(itemKind?: ItemKind): Promise<Service[]> {
    const services = await Service.query().withScopes((scopes) => {
      scopes.active()
      scopes.ordered()
    })

    if (!itemKind) {
      return services
    }

    return services.filter((service) => service.itemKinds.includes(itemKind))
  }

  async getOwnerServices(): Promise<Service[]> {
    return Service.query().withScopes((scopes) => {
      scopes.available()
      scopes.ordered()
    })
  }

  async findAvailableService(id: number): Promise<Service> {
    const service = await Service.query()
      .where('id', id)
      .withScopes((scopes) => scopes.available())
      .first()

    if (!service) {
      throw new Exception('Layanan tidak ditemukan.', { status: 404 })
    }

    return service
  }

  async createService(data: ServiceData, actor: User): Promise<Service> {
    let order = data.displayOrder
    if (order === undefined || order === null) {
      const highest = await Service.query()
        .withScopes((scopes) => scopes.available())
        .orderBy('display_order', 'desc')
        .first()
      order = highest ? highest.displayOrder + 1 : 0
    }

    const service = await Service.create({
      name: data.name,
      type: data.type,
      itemKinds: data.itemKinds,
      price: data.price,
      estimatedDays: data.estimatedDays,
      isStartingFrom: data.isStartingFrom,
      description: data.description,
      isActive: data.isActive ?? true,
      displayOrder: order,
      deletedAt: null,
    })

    await ActivityLog.create({
      userId: actor.id,
      category: 'service',
      action: 'service.create',
      description: `Menambahkan layanan "${service.name}" (${formatRupiah(service.price)})`,
      isSensitive: false,
    })

    return service
  }

  async updateService(id: number, data: ServiceData, actor: User): Promise<Service> {
    const service = await this.findAvailableService(id)
    const diffs: string[] = []

    if (service.name !== data.name) {
      diffs.push(`Nama: "${service.name}" → "${data.name}"`)
    }
    if (service.price !== data.price) {
      diffs.push(`Harga: ${formatRupiah(service.price)} → ${formatRupiah(data.price)}`)
    }
    if (service.type !== data.type) {
      diffs.push(`Jenis: ${service.type} → ${data.type}`)
    }
    if (service.estimatedDays !== data.estimatedDays) {
      diffs.push(`Estimasi: ${service.estimatedDays} hari → ${data.estimatedDays} hari`)
    }
    if (service.isStartingFrom !== data.isStartingFrom) {
      diffs.push(
        `Mulai dari: ${service.isStartingFrom ? 'Ya' : 'Tidak'} → ${data.isStartingFrom ? 'Ya' : 'Tidak'}`
      )
    }
    if (data.isActive !== undefined && service.isActive !== data.isActive) {
      diffs.push(
        `Status: ${service.isActive ? 'Aktif' : 'Nonaktif'} → ${data.isActive ? 'Aktif' : 'Nonaktif'}`
      )
      service.isActive = data.isActive
    }
    if (data.displayOrder !== undefined && service.displayOrder !== data.displayOrder) {
      service.displayOrder = data.displayOrder
    }

    service.name = data.name
    service.type = data.type
    service.itemKinds = data.itemKinds
    service.price = data.price
    service.estimatedDays = data.estimatedDays
    service.isStartingFrom = data.isStartingFrom
    service.description = data.description

    await service.save()

    await ActivityLog.create({
      userId: actor.id,
      category: 'service',
      action: 'service.update',
      description: `Mengubah layanan "${service.name}": ${diffs.join(', ') || 'tidak ada perubahan'}`,
      isSensitive: false,
    })

    return service
  }

  async toggleServiceActive(id: number, isActive: boolean, actor: User): Promise<Service> {
    const service = await this.findAvailableService(id)
    service.isActive = isActive
    await service.save()

    await ActivityLog.create({
      userId: actor.id,
      category: 'service',
      action: 'service.toggle',
      description: `${isActive ? 'Mengaktifkan' : 'Menonaktifkan'} layanan "${service.name}"`,
      isSensitive: false,
    })

    return service
  }

  async bulkToggleServices(ids: number[], isActive: boolean, actor: User): Promise<Service[]> {
    const services = await Service.query()
      .whereIn('id', ids)
      .withScopes((scopes) => scopes.available())

    if (services.length > 0) {
      await Service.query()
        .whereIn('id', ids)
        .withScopes((scopes) => scopes.available())
        .update({ is_active: isActive })

      await ActivityLog.create({
        userId: actor.id,
        category: 'service',
        action: 'service.bulk_toggle',
        description: `${isActive ? 'Mengaktifkan' : 'Menonaktifkan'} ${services.length} layanan`,
        isSensitive: false,
      })
    }

    return services
  }

  async softDeleteService(id: number, actor: User): Promise<Service> {
    const service = await this.findAvailableService(id)
    service.deletedAt = DateTime.now()
    service.isActive = false
    await service.save()

    await ActivityLog.create({
      userId: actor.id,
      category: 'service',
      action: 'service.delete',
      description: `Menghapus layanan "${service.name}"`,
      isSensitive: true,
    })

    return service
  }
}
