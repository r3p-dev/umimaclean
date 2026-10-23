import { belongsTo, hasMany, hasOne, scope } from '@adonisjs/lucid/orm'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
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

export const CLAIM_HOURS = 3

export const TASK_TAKEN_MESSAGE = 'Tugas ini sedang ditangani staf lain. Pilih pesanan lain.'

export default class Order extends OrderSchema {
  static claimFloor() {
    return DateTime.now().minus({ hours: CLAIM_HOURS })
  }

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

  @belongsTo(() => User, { foreignKey: 'claimedBy' })
  declare claimer: BelongsTo<typeof User>

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

  isClaimedBy(user: User) {
    return this.claimedBy === user.id && !!this.claimedAt && this.claimedAt > Order.claimFloor()
  }

  isClaimedByOther(user: User) {
    if (this.claimedBy === null || this.claimedBy === user.id) {
      return false
    }
    return !!this.claimedAt && this.claimedAt > Order.claimFloor()
  }

  clearClaim() {
    this.claimedBy = null
    this.claimedTask = null
    this.claimedAt = null
  }
}
