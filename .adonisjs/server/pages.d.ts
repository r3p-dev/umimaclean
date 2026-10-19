import '@adonisjs/inertia/types'

import type React from 'react'
import type { Prettify } from '@adonisjs/core/types/common'

type ExtractProps<T> =
  T extends React.FC<infer Props>
    ? Prettify<Omit<Props, 'children'>>
    : T extends React.Component<infer Props>
      ? Prettify<Omit<Props, 'children'>>
      : never

declare module '@adonisjs/inertia/types' {
  export interface InertiaPages {
    'admin/activity': ExtractProps<(typeof import('../../inertia/pages/admin/activity.tsx'))['default']>
    'admin/customers': ExtractProps<(typeof import('../../inertia/pages/admin/customers.tsx'))['default']>
    'admin/orders/detail': ExtractProps<(typeof import('../../inertia/pages/admin/orders/detail.tsx'))['default']>
    'admin/orders/list': ExtractProps<(typeof import('../../inertia/pages/admin/orders/list.tsx'))['default']>
    'admin/reports': ExtractProps<(typeof import('../../inertia/pages/admin/reports.tsx'))['default']>
    'admin/services': ExtractProps<(typeof import('../../inertia/pages/admin/services.tsx'))['default']>
    'admin/settings/staff': ExtractProps<(typeof import('../../inertia/pages/admin/settings/staff.tsx'))['default']>
    'admin/settings/store': ExtractProps<(typeof import('../../inertia/pages/admin/settings/store.tsx'))['default']>
    'admin/summary': ExtractProps<(typeof import('../../inertia/pages/admin/summary.tsx'))['default']>
    'customer/order/confirm': ExtractProps<(typeof import('../../inertia/pages/customer/order/confirm.tsx'))['default']>
    'customer/order/created': ExtractProps<(typeof import('../../inertia/pages/customer/order/created.tsx'))['default']>
    'customer/order/details': ExtractProps<(typeof import('../../inertia/pages/customer/order/details.tsx'))['default']>
    'customer/order/items': ExtractProps<(typeof import('../../inertia/pages/customer/order/items.tsx'))['default']>
    'customer/payment/bill': ExtractProps<(typeof import('../../inertia/pages/customer/payment/bill.tsx'))['default']>
    'customer/payment/qris': ExtractProps<(typeof import('../../inertia/pages/customer/payment/qris.tsx'))['default']>
    'customer/tracking/orders': ExtractProps<(typeof import('../../inertia/pages/customer/tracking/orders.tsx'))['default']>
    'customer/tracking/sign_in': ExtractProps<(typeof import('../../inertia/pages/customer/tracking/sign_in.tsx'))['default']>
    'customer/tracking/status': ExtractProps<(typeof import('../../inertia/pages/customer/tracking/status.tsx'))['default']>
    'errors/not_found': ExtractProps<(typeof import('../../inertia/pages/errors/not_found.tsx'))['default']>
    'errors/server_error': ExtractProps<(typeof import('../../inertia/pages/errors/server_error.tsx'))['default']>
    'home': ExtractProps<(typeof import('../../inertia/pages/home.tsx'))['default']>
    'staff/account/history': ExtractProps<(typeof import('../../inertia/pages/staff/account/history.tsx'))['default']>
    'staff/account/profile': ExtractProps<(typeof import('../../inertia/pages/staff/account/profile.tsx'))['default']>
    'staff/home': ExtractProps<(typeof import('../../inertia/pages/staff/home.tsx'))['default']>
    'staff/more': ExtractProps<(typeof import('../../inertia/pages/staff/more.tsx'))['default']>
    'staff/process/inspection': ExtractProps<(typeof import('../../inertia/pages/staff/process/inspection.tsx'))['default']>
    'staff/process/queue': ExtractProps<(typeof import('../../inertia/pages/staff/process/queue.tsx'))['default']>
    'staff/process/washing': ExtractProps<(typeof import('../../inertia/pages/staff/process/washing.tsx'))['default']>
    'staff/store/payment': ExtractProps<(typeof import('../../inertia/pages/staff/store/payment.tsx'))['default']>
    'staff/store/photo': ExtractProps<(typeof import('../../inertia/pages/staff/store/photo.tsx'))['default']>
    'staff/store/walk_in': ExtractProps<(typeof import('../../inertia/pages/staff/store/walk_in.tsx'))['default']>
    'staff/tasks/active': ExtractProps<(typeof import('../../inertia/pages/staff/tasks/active.tsx'))['default']>
    'staff/tasks/queue': ExtractProps<(typeof import('../../inertia/pages/staff/tasks/queue.tsx'))['default']>
  }
}
