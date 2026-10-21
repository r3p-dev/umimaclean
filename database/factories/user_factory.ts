import factory from '@adonisjs/lucid/factories'
import { DateTime } from 'luxon'
import { Role } from '#enums/role_enum'
import User from '#models/user'
import { CustomerAddressFactory } from '#database/factories/customer_address_factory'
import { OrderFactory } from '#database/factories/order_factory'

export const USER_PASSWORD = 'rahasia-umima-123'

export const UserFactory = factory
  .define(User, ({ faker }) => ({
    role: Role.CUSTOMER,
    phone: '628' + faker.string.numeric(9),
    name: faker.person.fullName(),
    password: USER_PASSWORD,
    phoneVerifiedAt: DateTime.now(),
  }))
  .state('staff', (user) => {
    user.role = Role.STAFF
  })
  .state('admin', (user) => {
    user.role = Role.ADMIN
  })
  .relation('addresses', () => CustomerAddressFactory)
  .relation('orders', () => OrderFactory)
  .build()
