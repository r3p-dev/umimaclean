import factory from '@adonisjs/lucid/factories'
import CustomerAddress from '#models/customer_address'

export const CustomerAddressFactory = factory
  .define(CustomerAddress, ({ faker }) => ({
    label: 'Rumah',
    recipientName: faker.person.fullName(),
    recipientPhone: null,
    addressText: `Jl. ${faker.location.street()} No. ${faker.number.int({ min: 1, max: 99 })}, Coblong`,
    landmark: null,
    lat: -6.8848,
    lng: 107.6152,
    isPrimary: false,
    lastUsedAt: null,
    deletedAt: null,
  }))
  .build()
