import { Bouncer } from '@adonisjs/bouncer'
import { Role, STAFF_ROLES } from '#enums/role_enum'
import type User from '#models/user'

export const enterCustomerArea = Bouncer.ability((user: User) => user.role === Role.CUSTOMER)

export const enterStaffArea = Bouncer.ability(
  (user: User) => STAFF_ROLES.includes(user.role) && user.isActive
)

export const enterAdminArea = Bouncer.ability(
  (user: User) => user.role === Role.ADMIN && user.isActive
)
