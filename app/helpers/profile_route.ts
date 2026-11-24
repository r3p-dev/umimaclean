import type { HttpContext } from '@adonisjs/core/http'

// The Profil pages live in three areas; the owner may also use the staff area (D108).
export type ProfileArea = 'customer' | 'staff' | 'admin'

const PROFILE_ROUTES = {
  customer: 'customer.profile.show',
  staff: 'staff.profile',
  admin: 'admin.profile',
} as const

// The area of the current request, from its route name ("staff.phone.edit" → "staff").
export function profileArea(ctx: HttpContext): ProfileArea {
  const area = ctx.route?.name?.split('.')[0]
  return area === 'staff' || area === 'admin' ? area : 'customer'
}

export function profileRoute(area: ProfileArea) {
  return PROFILE_ROUTES[area]
}
