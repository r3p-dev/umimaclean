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
    'auth/login': ExtractProps<(typeof import('../../inertia/pages/auth/login.tsx'))['default']>
    'auth/signup': ExtractProps<(typeof import('../../inertia/pages/auth/signup.tsx'))['default']>
    'errors/not_found': ExtractProps<(typeof import('../../inertia/pages/errors/not_found.tsx'))['default']>
    'errors/server_error': ExtractProps<(typeof import('../../inertia/pages/errors/server_error.tsx'))['default']>
    'public/about': ExtractProps<(typeof import('../../inertia/pages/public/about.tsx'))['default']>
    'public/area': ExtractProps<(typeof import('../../inertia/pages/public/area.tsx'))['default']>
    'public/areas_index': ExtractProps<(typeof import('../../inertia/pages/public/areas_index.tsx'))['default']>
    'public/contact': ExtractProps<(typeof import('../../inertia/pages/public/contact.tsx'))['default']>
    'public/faq': ExtractProps<(typeof import('../../inertia/pages/public/faq.tsx'))['default']>
    'public/home': ExtractProps<(typeof import('../../inertia/pages/public/home.tsx'))['default']>
    'public/order': ExtractProps<(typeof import('../../inertia/pages/public/order.tsx'))['default']>
    'public/pricing': ExtractProps<(typeof import('../../inertia/pages/public/pricing.tsx'))['default']>
    'public/service': ExtractProps<(typeof import('../../inertia/pages/public/service.tsx'))['default']>
    'public/services_index': ExtractProps<(typeof import('../../inertia/pages/public/services_index.tsx'))['default']>
  }
}
