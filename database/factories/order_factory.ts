import { randomUUID } from 'node:crypto'
import factory from '@adonisjs/lucid/factories'
import { DateTime } from 'luxon'
import { OrderStatus } from '#enums/order_enum'
import Order from '#models/order'
import { SERVICE_ZONE } from '#validators/shared/rules/pickup'
import { OrderAddressFactory } from '#database/factories/order_address_factory'

export const OrderFactory = factory
  .define(Order, ({ faker }) => ({
    customerName: faker.person.fullName(),
    customerPhone: '628' + faker.string.numeric(9),
    requestKey: randomUUID(),
    itemsSepatu: 1,
    itemsTas: 0,
    itemsHelm: 0,
    note: '',
    pickupDate: DateTime.now().setZone(SERVICE_ZONE).plus({ days: 1 }).startOf('day'),
    pickupSlot: 0,
    status: OrderStatus.AWAITING_PICKUP,
  }))
  .relation('addresses', () => OrderAddressFactory)
  .build()
