import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import logger from '@adonisjs/core/services/logger'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import { ActivityAction } from '#enums/activity_enum'
import {
  ItemKind,
  ItemKindLabel,
  OrderAddressType,
  OrderSource,
  OrderStatus,
  PhotoKind,
  ReturnMethod,
} from '#enums/order_enum'
import { PaymentChannel, PaymentMethod, PaymentStatus } from '#enums/payment_enum'
import { Role } from '#enums/role_enum'
import { ServiceType } from '#enums/service_enum'
import ActivityLog from '#models/activity_log'
import Bill from '#models/bill'
import BillLine from '#models/bill_line'
import CustomerAddress from '#models/customer_address'
import Order from '#models/order'
import OrderAddress from '#models/order_address'
import OrderEvent from '#models/order_event'
import OrderItem from '#models/order_item'
import OrderPhoto, { proofPath } from '#models/order_photo'
import Payment from '#models/payment'
import Service from '#models/service'
import User from '#models/user'
import { snapshotOf } from '#services/order_service'
import { orderRoute } from '#transformers/order_transformer'
import { ORDER_STATUS_SEQUENCE } from '#enums/order_enum'
import { SERVICE_ZONE } from '#validators/shared/rules/pickup'
import { DEMO_CUSTOMERS, DEMO_PHONE } from '#database/seeders/user_seeder'

const PLACEHOLDER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
)

const COURIER_STEPS = [
  OrderStatus.COURIER_EN_ROUTE,
  OrderStatus.PICKED_UP,
  OrderStatus.IN_DELIVERY,
  OrderStatus.COMPLETED,
] as const

type Staff = { courier: User; owner: User }

type Spec = {
  customer: User | null
  walkIn?: { name: string; phone: string }
  source: OrderSource
  returnMethod: ReturnMethod
  status: OrderStatus
  items: [number, number, number]
  createdAt: DateTime
  pickupSlot?: number
  method?: PaymentMethod
  note?: string
  cancelReason?: string
}

function rng(seed: number) {
  let value = seed
  return () => {
    value = (value * 1103515245 + 12345) % 2147483648
    return value / 2147483648
  }
}

export default class extends BaseSeeder {
  #random = rng(20261021)

  override async run() {
    if (await Order.query().first()) {
      logger.info('Demo orders already exist, skipping')
      return
    }
    const staff = {
      courier: await User.query().where('role', Role.STAFF).firstOrFail(),
      owner: await User.query().where('role', Role.ADMIN).firstOrFail(),
    }
    const rina = await User.findByOrFail('phone', DEMO_PHONE)
    const customers = [rina]
    for (const [, phone] of DEMO_CUSTOMERS) {
      customers.push(await User.findByOrFail('phone', phone))
    }
    const services = await Service.query().where('is_active', true)
    const today = DateTime.now().setZone(SERVICE_ZONE).startOf('day')
    const pick = <T>(list: readonly T[]) => list[Math.floor(this.#random() * list.length)]

    for (let day = 120; day >= 1; day -= 1) {
      const count = day > 60 ? (day % 9 === 0 ? 1 : 0) : day % 3 === 0 ? 2 : 1
      for (let index = 0; index < count; index++) {
        const isWalkIn = this.#random() < 0.3
        const customer = day > 60 ? customers[1 + (day % 4)] : pick(customers.slice(0, 8))
        await this.#build(
          {
            customer: isWalkIn && this.#random() < 0.5 ? null : customer,
            walkIn: { name: 'Andi Pratama', phone: '6281910384627' },
            source: isWalkIn ? OrderSource.STORE : OrderSource.ONLINE,
            returnMethod:
              isWalkIn && this.#random() < 0.6 ? ReturnMethod.STORE : ReturnMethod.DELIVERY,
            status: OrderStatus.COMPLETED,
            items: [
              1 + Math.floor(this.#random() * 2),
              this.#random() < 0.3 ? 1 : 0,
              this.#random() < 0.2 ? 1 : 0,
            ],
            createdAt: today.minus({ days: day }).plus({ hours: 9 + index * 3 }),
            pickupSlot: index % 3,
            method: isWalkIn
              ? pick([PaymentMethod.CASH, PaymentMethod.CARD, PaymentMethod.QRIS])
              : PaymentMethod.QRIS,
          },
          staff,
          services
        )
      }
    }

    const active: [OrderStatus, OrderSource, ReturnMethod, number][] = [
      [OrderStatus.AWAITING_PICKUP, OrderSource.ONLINE, ReturnMethod.DELIVERY, 2],
      [OrderStatus.AWAITING_PICKUP, OrderSource.ONLINE, ReturnMethod.DELIVERY, 3],
      [OrderStatus.AWAITING_PICKUP, OrderSource.ONLINE, ReturnMethod.DELIVERY, 4],
      [OrderStatus.COURIER_EN_ROUTE, OrderSource.ONLINE, ReturnMethod.DELIVERY, 5],
      [OrderStatus.PICKED_UP, OrderSource.ONLINE, ReturnMethod.DELIVERY, 6],
      [OrderStatus.IN_INSPECTION, OrderSource.STORE, ReturnMethod.STORE, 7],
      [OrderStatus.AWAITING_PAYMENT, OrderSource.STORE, ReturnMethod.STORE, 1],
      [OrderStatus.IN_CLEANING, OrderSource.ONLINE, ReturnMethod.DELIVERY, 2],
      [OrderStatus.IN_CLEANING, OrderSource.STORE, ReturnMethod.STORE, 3],
      [OrderStatus.READY_FOR_DELIVERY, OrderSource.ONLINE, ReturnMethod.DELIVERY, 4],
      [OrderStatus.READY_FOR_DELIVERY, OrderSource.ONLINE, ReturnMethod.DELIVERY, 5],
      [OrderStatus.IN_DELIVERY, OrderSource.ONLINE, ReturnMethod.DELIVERY, 6],
      [OrderStatus.READY_FOR_COLLECTION, OrderSource.STORE, ReturnMethod.STORE, 7],
      [OrderStatus.CANCELLED, OrderSource.ONLINE, ReturnMethod.DELIVERY, 8],
    ]
    for (const [position, [status, source, returnMethod, customerIndex]] of active.entries()) {
      await this.#build(
        {
          customer: customers[customerIndex],
          source,
          returnMethod,
          status,
          items: [1 + (position % 2), position % 3 === 0 ? 1 : 0, position % 4 === 0 ? 1 : 0],
          createdAt:
            status === OrderStatus.AWAITING_PICKUP
              ? today.minus({ days: 1 }).plus({ hours: 19 })
              : today.plus({ hours: 7, minutes: position * 10 }),
          pickupSlot: position % 3,
          method: source === OrderSource.STORE ? PaymentMethod.CASH : PaymentMethod.QRIS,
          cancelReason: status === OrderStatus.CANCELLED ? 'Salah jadwal' : undefined,
        },
        staff,
        services
      )
    }

    await this.#build(
      {
        customer: rina,
        source: OrderSource.ONLINE,
        returnMethod: ReturnMethod.DELIVERY,
        status: OrderStatus.AWAITING_PAYMENT,
        items: [2, 1, 0],
        createdAt: today.minus({ days: 1 }).plus({ hours: 14 }),
        pickupSlot: 0,
        note: 'Sepatu putih ada noda kopi di bagian depan.',
      },
      staff,
      services
    )

    logger.info(
      `Demo orders created: ${await Order.query()
        .count('* as total')
        .then((rows) => rows[0].$extras.total)}`
    )
  }

  async #build(spec: Spec, staff: Staff, services: Service[]) {
    const customer = spec.customer
    const name = customer?.name ?? spec.walkIn?.name ?? 'Pelanggan toko'
    const phone = customer?.phone ?? spec.walkIn?.phone ?? ''
    const isOnline = spec.source === OrderSource.ONLINE
    const order = await Order.create({
      userId: customer?.id ?? null,
      requestKey: randomUUID(),
      source: spec.source,
      returnMethod: spec.returnMethod,
      customerName: name,
      customerPhone: phone,
      status: spec.status,
      itemsSepatu: spec.items[0],
      itemsTas: spec.items[1],
      itemsHelm: spec.items[2],
      note: spec.note ?? '',
      pickupDate: isOnline ? spec.createdAt.plus({ days: 1 }).startOf('day') : null,
      pickupSlot: isOnline ? (spec.pickupSlot ?? 0) : null,
      cancelReason: spec.cancelReason ?? null,
      createdAt: spec.createdAt,
      updatedAt: spec.createdAt,
    })

    const address = customer
      ? await CustomerAddress.query()
          .where('user_id', customer.id)
          .where('is_primary', true)
          .first()
      : null
    if (address && customer) {
      const types = isOnline
        ? Object.values(OrderAddressType)
        : spec.returnMethod === ReturnMethod.DELIVERY
          ? [OrderAddressType.DELIVERY]
          : []
      for (const type of types) {
        await OrderAddress.create({ ...snapshotOf(customer, address), orderId: order.id, type })
      }
    } else if (spec.returnMethod === ReturnMethod.DELIVERY) {
      order.returnMethod = ReturnMethod.STORE
      await order.save()
    }

    const route = orderRoute(order.source, order.returnMethod).map(
      (index) => ORDER_STATUS_SEQUENCE[index]
    )
    const steps =
      spec.status === OrderStatus.CANCELLED
        ? [OrderStatus.AWAITING_PICKUP, OrderStatus.CANCELLED]
        : route.slice(0, route.indexOf(spec.status) + 1)
    let at = isOnline ? spec.createdAt : spec.createdAt
    let total = 0

    for (const [position, status] of steps.entries()) {
      if (position > 0) {
        at = at.plus({ hours: status === OrderStatus.COURIER_EN_ROUTE ? 13 : 2 })
      }
      const actor = this.#actorFor(status, staff, customer, position === 0)
      await OrderEvent.create({
        orderId: order.id,
        status,
        actorId: actor?.id ?? null,
        note:
          status === OrderStatus.COMPLETED && order.returnMethod === ReturnMethod.DELIVERY
            ? `Diterima oleh ${name.split(' ')[0]}`
            : status === OrderStatus.CANCELLED
              ? `Dibatalkan pelanggan: ${spec.cancelReason}`
              : null,
        createdAt: at,
      })

      if (status === OrderStatus.PICKED_UP) {
        await this.#photo(order, PhotoKind.PICKUP, staff.courier, at)
        await this.#log(
          staff.courier,
          order,
          ActivityAction.PICKUP_DONE,
          `${order.itemCount()} barang dijemput · foto bukti`,
          at
        )
      }
      if (status === OrderStatus.IN_INSPECTION && !isOnline) {
        await this.#photo(order, PhotoKind.INTAKE, staff.courier, at)
        await this.#log(
          staff.courier,
          order,
          ActivityAction.WALK_IN_CREATED,
          `${order.itemCount()} barang · ${name}`,
          at
        )
      }
      if (status === OrderStatus.AWAITING_PAYMENT) {
        total = await this.#bill(order, services, staff.courier, at)
        await this.#log(
          staff.courier,
          order,
          ActivityAction.BILL_CREATED,
          `${order.itemCount()} barang · Rp${total.toLocaleString('id-ID')}`,
          at
        )
      }
      if (status === OrderStatus.IN_CLEANING) {
        const method = spec.method ?? PaymentMethod.QRIS
        const isCounter = !isOnline || method !== PaymentMethod.QRIS
        await Payment.create({
          orderId: order.id,
          channel: isOnline ? PaymentChannel.ONLINE : PaymentChannel.COUNTER,
          method,
          status: PaymentStatus.PAID,
          amount: total,
          cashReceived: method === PaymentMethod.CASH ? Math.ceil(total / 50000) * 50000 : null,
          reference: method === PaymentMethod.CARD ? `APR${order.id}` : null,
          providerOrderId: isOnline ? `UMC-${order.id}-${at.toMillis()}` : null,
          providerTransactionId: isOnline ? randomUUID() : null,
          paidAt: at,
          recordedBy: isCounter ? staff.courier.id : null,
          createdAt: at,
          updatedAt: at,
        })
        if (isCounter) {
          await this.#log(
            staff.courier,
            order,
            ActivityAction.PAYMENT_RECORDED,
            `${method} · Rp${total.toLocaleString('id-ID')}`,
            at
          )
        }
      }
      if (
        status === OrderStatus.READY_FOR_DELIVERY ||
        status === OrderStatus.READY_FOR_COLLECTION
      ) {
        await this.#photo(order, PhotoKind.WASHING, staff.courier, at)
        await OrderItem.query().where('order_id', order.id).update({ washed_at: at.toJSDate() })
        await this.#log(staff.courier, order, ActivityAction.WASH_DONE, 'Foto hasil cuci', at)
      }
      if (status === OrderStatus.COMPLETED) {
        if (order.returnMethod === ReturnMethod.DELIVERY) {
          await this.#photo(order, PhotoKind.DELIVERY, staff.courier, at)
          order.receiverName = name.split(' ')[0]
          await this.#log(
            staff.courier,
            order,
            ActivityAction.DELIVERY_DONE,
            `Foto bukti · diterima oleh “${order.receiverName}”`,
            at
          )
        } else {
          await this.#log(staff.courier, order, ActivityAction.COLLECTED, 'Diambil di toko', at)
        }
      }
    }

    order.updatedAt = at
    await order.save()
  }

  #actorFor(status: OrderStatus, staff: Staff, customer: User | null, isFirst: boolean) {
    if (isFirst) {
      return customer && status === OrderStatus.AWAITING_PICKUP ? customer : staff.courier
    }
    if ((COURIER_STEPS as readonly OrderStatus[]).includes(status)) {
      return staff.courier
    }
    if (status === OrderStatus.IN_CLEANING || status === OrderStatus.CANCELLED) {
      return status === OrderStatus.CANCELLED ? customer : null
    }
    return staff.courier
  }

  async #bill(order: Order, services: Service[], staff: User, at: DateTime) {
    const kinds: ItemKind[] = [
      ...Array.from({ length: order.itemsSepatu }, () => ItemKind.SHOE),
      ...Array.from({ length: order.itemsTas }, () => ItemKind.BAG),
      ...Array.from({ length: order.itemsHelm }, () => ItemKind.HELMET),
    ]
    const bill = await Bill.create({
      orderId: order.id,
      total: 0,
      decidedBy: staff.id,
      createdAt: at,
      updatedAt: at,
    })
    let total = 0
    for (const [index, kind] of kinds.entries()) {
      const main = services.filter(
        (service) => service.type === ServiceType.MAIN && service.categories.includes(kind)
      )
      const addons = services.filter(
        (service) => service.type === ServiceType.ADDON && service.categories.includes(kind)
      )
      const chosen = [
        main[Math.floor(this.#random() * main.length)],
        ...(addons.length && this.#random() < 0.35 ? [addons[0]] : []),
      ].filter(Boolean)
      const item = await OrderItem.create({
        orderId: order.id,
        kind,
        name: `${ItemKindLabel[kind]} ${index + 1}`,
        note: '',
        position: index + 1,
      })
      for (const service of chosen) {
        await BillLine.create({
          billId: bill.id,
          orderItemId: item.id,
          serviceId: service.id,
          name: service.name,
          price: service.price,
        })
        total += service.price
      }
    }
    bill.total = total
    await bill.save()
    return total
  }

  async #photo(order: Order, kind: PhotoKind, staff: User, at: DateTime) {
    const path = `${order.id}/${kind}-demo.png`
    await mkdir(dirname(proofPath(path)), { recursive: true })
    await writeFile(proofPath(path), PLACEHOLDER)
    await OrderPhoto.create({ orderId: order.id, kind, path, takenBy: staff.id, createdAt: at })
  }

  async #log(actor: User, order: Order, action: ActivityAction, detail: string, at: DateTime) {
    await ActivityLog.create({
      actorId: actor.id,
      orderId: order.id,
      action,
      detail,
      isSensitive: false,
      createdAt: at,
    })
  }
}
