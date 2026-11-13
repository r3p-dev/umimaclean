import type { ReactNode } from 'react'
import { Link } from '@adonisjs/inertia/react'
import { urlFor } from '~/client'
import type { NavigationItem as Item } from '~/lib/navigation/links'

export default function NavigationItem({
  item,
  isActive,
  className,
  children,
}: {
  item: Item<string>
  isActive: boolean
  className: string
  children: ReactNode
}) {
  if (!item.route) {
    return (
      <span aria-disabled="true" className={className}>
        {children}
      </span>
    )
  }

  return (
    <Link
      href={urlFor(item.route)}
      aria-current={isActive ? 'page' : undefined}
      className={className}
    >
      {children}
    </Link>
  )
}
