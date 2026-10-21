import factory from '@adonisjs/lucid/factories'
import { OrderAddressType } from '#enums/order_enum'
import OrderAddress from '#models/order_address'

export const OrderAddressFactory = factory
  .define(OrderAddress, ({ faker }) => ({
    type: OrderAddressType.PICKUP as OrderAddressType,
    customerAddressId: null,
    label: 'Rumah',
    recipientName: faker.person.fullName(),
    recipientPhone: '628' + faker.string.numeric(9),
    addressText: `Jl. ${faker.location.street()} No. ${faker.number.int({ min: 1, max: 99 })}, Coblong`,
    landmark: null,
    lat: -6.8848,
    lng: 107.6152,
  }))
  .state('delivery', (address) => {
    address.type = OrderAddressType.DELIVERY
  })
  .build()
