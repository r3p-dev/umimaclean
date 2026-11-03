import { type ReactNode } from 'react'
import { Link } from '@adonisjs/inertia/react'
import Logo from '~/components/atoms/logo'

export default function FlowHeader({
  title,
  showLogo = true,
  children,
}: {
  title: string
  showLogo?: boolean
  children?: ReactNode
}) {
  return (
    <header className="border-b border-border">
      <div className="mx-auto box-content flex h-14 max-w-page items-center gap-1 px-5">
        {showLogo && (
          <span className="mr-1.5 hidden items-center border-r border-border pr-3.5 sm:flex">
            <Link route="home" className="rounded-xs">
              <Logo />
            </Link>
          </span>
        )}
        <p className="flex-1 text-base leading-none font-semibold">{title}</p>
      </div>
      {children && <div className="mx-auto box-content max-w-page px-5">{children}</div>}
    </header>
  )
}
