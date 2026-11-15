import { Bouncer } from '@adonisjs/bouncer'
import type User from '#models/user'

export const accessCustomer = Bouncer.ability((user: User) => {
  return user.role === 'customer'
})

export const accessStaff = Bouncer.ability((user: User) => {
  return user.role === 'staff' || user.role === 'admin'
})

export const accessAdmin = Bouncer.ability((user: User) => {
  return user.role === 'admin'
})
