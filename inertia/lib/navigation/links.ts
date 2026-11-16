import type { urlFor } from '~/client'

export type NavigationRoute = Parameters<typeof urlFor>[0]

// Each milestone adds navigation items when it builds the corresponding page.
export type NavigationItem<Key extends string> = {
  key: Key
  label: string
  route: NavigationRoute
}
