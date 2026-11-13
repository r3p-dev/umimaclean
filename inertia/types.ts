import type { Data } from '@generated/data'

// Types usePage().props and usePage().flash with the shared props and flash data inferred from the
// Inertia middleware, so no call site has to pass a generic.
declare module '@inertiajs/core' {
  interface InertiaConfig {
    sharedPageProps: Data.SharedProps
    flashDataType: Data.FlashMessages
  }
}
