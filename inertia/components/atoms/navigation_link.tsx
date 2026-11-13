import { urlFor } from '~/client'
import type { ReactNode } from 'react'
import { usePage } from '@inertiajs/react'
import type { LucideIcon } from 'lucide-react'
import { Link } from '@adonisjs/inertia/react'

export type NavigationRoute = Parameters<typeof urlFor>[0]

export type NavigationItem = {
  label: string
  route: NavigationRoute
  icon?: LucideIcon
}

// Marks itself with aria-current="page" when the URL is its route or, unless isExact, a URL below it
// (a "Settings" link stays active on "/settings/security").
export default function NavigationLink({
  route,
  isExact = false,
  className,
  children,
}: {
  route: NavigationRoute
  isExact?: boolean
  className?: string
  children: ReactNode
}) {
  const { url } = usePage()
  const href = urlFor(route)
  const path = url.split('?')[0]
  const isActive = isExact ? path === href : path === href || path.startsWith(`${href}/`)

  return (
    <Link href={href} className={className} aria-current={isActive ? 'page' : undefined}>
      {children}
    </Link>
  )
}
