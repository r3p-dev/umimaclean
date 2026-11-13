import type { urlFor } from '~/client'

export type NavigationRoute = Parameters<typeof urlFor>[0]

// A page that doesn't exist yet has no route; its item is shown but not clickable.
export type NavigationItem<Key extends string> = {
  key: Key
  label: string
  route?: NavigationRoute
}
