// The owner may also use the staff area, so pages name their area instead of reading the role.
export type ProfileArea = 'customer' | 'staff' | 'admin'

// The Profil pages per role; the forms on them are shared (D108).
export const PROFILE_ROUTES = {
  customer: {
    show: 'customer.profile.show',
    edit: 'customer.profile.edit',
    update: 'customer.profile.update',
    phone: 'customer.phone.edit',
    phoneStore: 'customer.phone.store',
  },
  staff: {
    show: 'staff.profile',
    edit: 'staff.profile.edit',
    update: 'staff.profile.update',
    phone: 'staff.phone.edit',
    phoneStore: 'staff.phone.store',
  },
  admin: {
    show: 'admin.profile',
    edit: 'admin.profile.edit',
    update: 'admin.profile.update',
    phone: 'admin.phone.edit',
    phoneStore: 'admin.phone.store',
  },
} as const satisfies Record<ProfileArea, Record<string, string>>
