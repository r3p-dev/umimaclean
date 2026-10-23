import { belongsTo, hasMany, hasOne, scope } from '@adonisjs/lucid/orm'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import { OrderSchema } from '#database/schema'
import {
  FINISHED_STATUSES,
  ORDER_TRANSITIONS,
  OrderAddressType,
  OrderStatus,
  OrderStatusStage,
} from '#enums/order_enum'
import { PaymentStatus } from '#enums/payment_enum'
import Bill from '#models/bill'
import OrderAddress from '#models/order_address'
import OrderEvent from '#models/order_event'
import OrderItem from '#models/order_item'
import OrderPhoto from '#models/order_photo'
import Payment from '#models/payment'
import User from '#models/user'

export default class Order extends OrderSchema {
  static withDetails = scope((query: ModelQueryBuilderContract<typeof Order>) => {
    query.preload('user').preload('pickupAddress').preload('deliveryAddress')
  })

  static withHistory = scope((query: ModelQueryBuilderContract<typeof Order>) => {
    query
      .preload('events', (events) => events.preload('actor').orderBy('id', 'asc'))
      .preload('items', (items) => items.orderBy('position', 'asc'))
      .preload('bill', (bill) => bill.preload('lines', (lines) => lines.orderBy('id', 'asc')))
      .preload('payments', (payments) => payments.orderBy('id', 'asc'))
      .preload('photos', (photos) => photos.preload('taker').orderBy('id', 'asc'))
  })

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => OrderAddress)
  declare addresses: HasMany<typeof OrderAddress>

  @hasOne(() => OrderAddress, { onQuery: (query) => query.where('type', OrderAddressType.PICKUP) })
  declare pickupAddress: HasOne<typeof OrderAddress>

  @hasOne(() => OrderAddress, {
    onQuery: (query) => query.where('type', OrderAddressType.DELIVERY),
  })
  declare deliveryAddress: HasOne<typeof OrderAddress>

  @hasMany(() => OrderEvent)
  declare events: HasMany<typeof OrderEvent>

  @hasMany(() => OrderItem)
  declare items: HasMany<typeof OrderItem>

  @hasOne(() => Bill)
  declare bill: HasOne<typeof Bill>

  @hasMany(() => Payment)
  declare payments: HasMany<typeof Payment>

  @hasMany(() => OrderPhoto)
  declare photos: HasMany<typeof OrderPhoto>

  static numberOf(id: number) {
    return `UMC-${String(id).padStart(5, '0')}`
  }

  number() {
    return Order.numberOf(this.id)
  }

  itemCount() {
    return this.itemsSepatu + this.itemsTas + this.itemsHelm
  }

  paidPayment() {
    return this.payments?.find((payment) => payment.status === PaymentStatus.PAID) ?? null
  }

  canTransitionTo(to: OrderStatus, isOwnerOverride = false) {
    if (isOwnerOverride && to === OrderStatus.CANCELLED) {
      return !FINISHED_STATUSES.includes(this.status)
    }
    return ORDER_TRANSITIONS[this.status].includes(to)
  }

  ownerMoves() {
    return ORDER_TRANSITIONS[this.status].filter(
      (next) => next !== OrderStatus.IN_CLEANING && next !== OrderStatus.CANCELLED
    )
  }

  ownerStages() {
    return [...new Set(this.ownerMoves().map((next) => OrderStatusStage[next]))]
  }
}
