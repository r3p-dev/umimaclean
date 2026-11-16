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
    'admin/template_preview': ExtractProps<(typeof import('../../inertia/pages/admin/template_preview.tsx'))['default']>
    'auth/forgot_password': ExtractProps<(typeof import('../../inertia/pages/auth/forgot_password.tsx'))['default']>
    'auth/login': ExtractProps<(typeof import('../../inertia/pages/auth/login.tsx'))['default']>
    'auth/otp': ExtractProps<(typeof import('../../inertia/pages/auth/otp.tsx'))['default']>
    'auth/register': ExtractProps<(typeof import('../../inertia/pages/auth/register.tsx'))['default']>
    'auth/reset_password': ExtractProps<(typeof import('../../inertia/pages/auth/reset_password.tsx'))['default']>
    'auth/staff_login': ExtractProps<(typeof import('../../inertia/pages/auth/staff_login.tsx'))['default']>
    'customer/dashboard': ExtractProps<(typeof import('../../inertia/pages/customer/dashboard.tsx'))['default']>
    'customer/flow_template_preview': ExtractProps<(typeof import('../../inertia/pages/customer/flow_template_preview.tsx'))['default']>
    'errors/not_found': ExtractProps<(typeof import('../../inertia/pages/errors/not_found.tsx'))['default']>
    'errors/server_error': ExtractProps<(typeof import('../../inertia/pages/errors/server_error.tsx'))['default']>
    'home': ExtractProps<(typeof import('../../inertia/pages/home.tsx'))['default']>
    'legal/privacy': ExtractProps<(typeof import('../../inertia/pages/legal/privacy.tsx'))['default']>
    'legal/terms': ExtractProps<(typeof import('../../inertia/pages/legal/terms.tsx'))['default']>
    'og_image': ExtractProps<(typeof import('../../inertia/pages/og_image.tsx'))['default']>
    'staff/dashboard': ExtractProps<(typeof import('../../inertia/pages/staff/dashboard.tsx'))['default']>
    'staff/print_template_preview': ExtractProps<(typeof import('../../inertia/pages/staff/print_template_preview.tsx'))['default']>
    'staff/template_preview': ExtractProps<(typeof import('../../inertia/pages/staff/template_preview.tsx'))['default']>
  }
}
