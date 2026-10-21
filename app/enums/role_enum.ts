export const Role = {
  CUSTOMER: 'customer',
  STAFF: 'staff',
  ADMIN: 'admin',
} as const

export const RoleLabel = {
  [Role.CUSTOMER]: 'Pelanggan',
  [Role.STAFF]: 'Staf',
  [Role.ADMIN]: 'Owner',
} as const

export type Role = (typeof Role)[keyof typeof Role]

export const LoginRedirect = {
  [Role.CUSTOMER]: 'customer.home',
  [Role.STAFF]: 'staff.home',
  [Role.ADMIN]: 'admin.summary',
} as const

export const STAFF_ROLES: readonly Role[] = [Role.STAFF, Role.ADMIN]

export const ProfileRoute = {
  [Role.CUSTOMER]: { password: 'customer.profile.edit', devices: 'customer.profile.show' },
  [Role.STAFF]: { password: 'staff.profile', devices: 'staff.profile' },
  [Role.ADMIN]: { password: 'admin.profile', devices: 'admin.profile' },
} as const
