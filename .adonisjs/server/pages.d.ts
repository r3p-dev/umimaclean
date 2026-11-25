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
    'admin/dashboard': ExtractProps<(typeof import('../../inertia/pages/admin/dashboard.tsx'))['default']>
    'admin/profile_edit': ExtractProps<(typeof import('../../inertia/pages/admin/profile_edit.tsx'))['default']>
    'admin/profile_phone': ExtractProps<(typeof import('../../inertia/pages/admin/profile_phone.tsx'))['default']>
    'admin/profile': ExtractProps<(typeof import('../../inertia/pages/admin/profile.tsx'))['default']>
    'admin/services': ExtractProps<(typeof import('../../inertia/pages/admin/services.tsx'))['default']>
    'admin/settings/areas': ExtractProps<(typeof import('../../inertia/pages/admin/settings/areas.tsx'))['default']>
    'admin/settings/slots': ExtractProps<(typeof import('../../inertia/pages/admin/settings/slots.tsx'))['default']>
    'admin/settings/store': ExtractProps<(typeof import('../../inertia/pages/admin/settings/store.tsx'))['default']>
    'admin/template_preview': ExtractProps<(typeof import('../../inertia/pages/admin/template_preview.tsx'))['default']>
    'auth/forgot_password': ExtractProps<(typeof import('../../inertia/pages/auth/forgot_password.tsx'))['default']>
    'auth/login': ExtractProps<(typeof import('../../inertia/pages/auth/login.tsx'))['default']>
    'auth/otp': ExtractProps<(typeof import('../../inertia/pages/auth/otp.tsx'))['default']>
    'auth/register': ExtractProps<(typeof import('../../inertia/pages/auth/register.tsx'))['default']>
    'auth/reset_password': ExtractProps<(typeof import('../../inertia/pages/auth/reset_password.tsx'))['default']>
    'auth/staff_login': ExtractProps<(typeof import('../../inertia/pages/auth/staff_login.tsx'))['default']>
    'customer/addresses/form': ExtractProps<(typeof import('../../inertia/pages/customer/addresses/form.tsx'))['default']>
    'customer/addresses/index': ExtractProps<(typeof import('../../inertia/pages/customer/addresses/index.tsx'))['default']>
    'customer/dashboard': ExtractProps<(typeof import('../../inertia/pages/customer/dashboard.tsx'))['default']>
    'customer/flow_template_preview': ExtractProps<(typeof import('../../inertia/pages/customer/flow_template_preview.tsx'))['default']>
    'customer/orders/confirm': ExtractProps<(typeof import('../../inertia/pages/customer/orders/confirm.tsx'))['default']>
    'customer/orders/create': ExtractProps<(typeof import('../../inertia/pages/customer/orders/create.tsx'))['default']>
    'customer/orders/index': ExtractProps<(typeof import('../../inertia/pages/customer/orders/index.tsx'))['default']>
    'customer/orders/show': ExtractProps<(typeof import('../../inertia/pages/customer/orders/show.tsx'))['default']>
    'customer/profile/edit': ExtractProps<(typeof import('../../inertia/pages/customer/profile/edit.tsx'))['default']>
    'customer/profile/phone': ExtractProps<(typeof import('../../inertia/pages/customer/profile/phone.tsx'))['default']>
    'customer/profile/show': ExtractProps<(typeof import('../../inertia/pages/customer/profile/show.tsx'))['default']>
    'errors/not_found': ExtractProps<(typeof import('../../inertia/pages/errors/not_found.tsx'))['default']>
    'errors/server_error': ExtractProps<(typeof import('../../inertia/pages/errors/server_error.tsx'))['default']>
    'home': ExtractProps<(typeof import('../../inertia/pages/home.tsx'))['default']>
    'legal/privacy': ExtractProps<(typeof import('../../inertia/pages/legal/privacy.tsx'))['default']>
    'legal/terms': ExtractProps<(typeof import('../../inertia/pages/legal/terms.tsx'))['default']>
    'og_image': ExtractProps<(typeof import('../../inertia/pages/og_image.tsx'))['default']>
    'staff/dashboard': ExtractProps<(typeof import('../../inertia/pages/staff/dashboard.tsx'))['default']>
    'staff/print_template_preview': ExtractProps<(typeof import('../../inertia/pages/staff/print_template_preview.tsx'))['default']>
    'staff/profile_edit': ExtractProps<(typeof import('../../inertia/pages/staff/profile_edit.tsx'))['default']>
    'staff/profile_phone': ExtractProps<(typeof import('../../inertia/pages/staff/profile_phone.tsx'))['default']>
    'staff/profile': ExtractProps<(typeof import('../../inertia/pages/staff/profile.tsx'))['default']>
    'staff/template_preview': ExtractProps<(typeof import('../../inertia/pages/staff/template_preview.tsx'))['default']>
  }
}
