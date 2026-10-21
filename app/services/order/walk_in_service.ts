import { randomUUID } from 'node:crypto'
import { inject } from '@adonisjs/core'
import type { MultipartFile } from '@adonisjs/core/bodyparser'
import db from '@adonisjs/lucid/services/db'
import { ActivityAction } from '#enums/activity_enum'
import {
  OrderAddressType,
  OrderSource,
  OrderStatus,
  OrderTask,
  PhotoKind,
  ReturnMethod,
} from '#enums/order_enum'
import { Role } from '#enums/role_enum'
import Order from '#models/order'
import OrderAddress from '#models/order_address'
import User from '#models/user'
import ActivityService from '#services/activity_service'
import AddressBookService from '#services/address_book_service'
import { isUniqueViolation } from '#services/database_service'
import { snapshotOf } from '#services/order/order_service'
import OrderStatusService from '#services/order/order_status_service'
import OrderTaskService from '#services/order/order_task_service'
import { newPublicCode } from '#services/order/public_code_service'
import ProofPhotoService from '#services/proof_photo_service'
import type { WalkInPayload } from '#validators/staff/store'
import { fieldError } from '#validators/shared/field_error'

const CODE_RETRIES = 5

@inject()
export default class WalkInService {
  constructor(
    protected addresses: AddressBookService,
    protected statuses: OrderStatusService,
    protected tasks: OrderTaskService,
    protected activity: ActivityService,
    protected photos: ProofPhotoService
  ) {}

  async customerByPhone(phone: string) {
    return User.query().where('phone', phone).where('role', Role.CUSTOMER).first()
  }

  async create(staff: User, phone: string, payload: WalkInPayload) {
    const customer = await this.customerByPhone(phone)
    const name = customer?.name ?? payload.name?.trim()
    if (!name) {
      throw fieldError('name', 'Isi nama pelanggan.', 'name.required')
    }

    let delivery = null
    if (payload.returnMethod === ReturnMethod.DELIVERY) {
      const saved =
        customer && payload.useSavedAddress ? await this.addresses.primary(customer) : null
      if (saved) {
        delivery = snapshotOf(customer!, saved)
      } else {
        if (!payload.address || !payload.point) {
          throw fieldError('address', 'Isi alamat dan titik antar di peta.', 'address.required')
        }
        await this.addresses.assertServiceable(payload.point, 'address')
        delivery = {
          customerAddressId: null,
          label: 'Alamat antar',
          recipientName: name,
          recipientPhone: phone,
          addressText: payload.address,
          landmark: null,
          lat: payload.point.lat,
          lng: payload.point.lng,
        }
      }
    }

    return db.transaction(async (transaction) => {
      let order: Order | null = null
      for (let attempt = 0; attempt < CODE_RETRIES && !order; attempt++) {
        try {
          order = await transaction.transaction((savepoint) =>
            Order.create(
              {
                publicCode: newPublicCode(),
                userId: customer?.id ?? null,
                requestKey: randomUUID(),
                source: OrderSource.STORE,
                returnMethod: payload.returnMethod,
                customerName: name,
                customerPhone: phone,
                status: OrderStatus.IN_INSPECTION,
                itemsSepatu: payload.items.sepatu,
                itemsTas: payload.items.tas,
                itemsHelm: payload.items.helm,
                note: payload.note ?? '',
                pickupDate: null,
                pickupSlot: null,
              },
              { client: savepoint }
            )
          )
        } catch (error) {
          if (!isUniqueViolation(error)) {
            throw error
          }
        }
      }
      if (!order) {
        throw new Error('Could not allocate a unique order code')
      }

      if (delivery) {
        await OrderAddress.create(
          { ...delivery, orderId: order.id, type: OrderAddressType.DELIVERY },
          { client: transaction }
        )
      }
      await this.statuses.record(order, OrderStatus.IN_INSPECTION, { actor: staff }, transaction)
      await this.activity.record(
        {
          actor: staff,
          order,
          action: ActivityAction.WALK_IN_CREATED,
          detail: `${order.itemCount()} barang · ${name}`,
        },
        transaction
      )
      await this.tasks.claim(staff, order, OrderTask.INSPECTION, transaction)
      return order
    })
  }

  async addPhotos(staff: User, order: Order, files: MultipartFile[]) {
    await db.transaction(async (transaction) => {
      for (const file of files) {
        await this.photos.store(file, order, PhotoKind.INTAKE, staff, transaction)
      }
      await this.activity.record(
        {
          actor: staff,
          order,
          action: ActivityAction.ITEMS_PHOTOGRAPHED,
          detail: `${files.length} foto barang diterima`,
        },
        transaction
      )
    })
  }
}
