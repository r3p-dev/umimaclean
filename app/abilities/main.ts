import { Bouncer } from '@adonisjs/bouncer'
import type User from '#models/user'
import { Role, STAFF_ROLES } from '#enums/role_enum'

export const accessCustomer = Bouncer.ability((user: User) => {
  return user.role === Role.CUSTOMER
})

export const accessStaff = Bouncer.ability((user: User) => {
  return (STAFF_ROLES as readonly Role[]).includes(user.role)
})

export const accessAdmin = Bouncer.ability((user: User) => {
  return user.role === Role.ADMIN
})
