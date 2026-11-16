export const Role = {
  CUSTOMER: 'customer',
  STAFF: 'staff',
  ADMIN: 'admin',
} as const

export type Role = (typeof Role)[keyof typeof Role]

export const RoleLabel: Record<Role, string> = {
  [Role.CUSTOMER]: 'Pelanggan',
  [Role.STAFF]: 'Staf',
  [Role.ADMIN]: 'Owner',
}

export const STAFF_ROLES = [Role.STAFF, Role.ADMIN] as const
