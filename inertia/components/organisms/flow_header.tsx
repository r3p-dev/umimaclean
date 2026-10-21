import { type ReactNode } from 'react'
import { Link } from '@adonisjs/inertia/react'
import Logo from '~/components/atoms/logo'
import { cn } from '~/lib/shared/utils'

export default function FlowHeader({
  title,
  step,
  stepCount,
  showLogo = true,
  titleClassName,
  actions,
  className,
  children,
}: {
  title: string
  step?: number
  stepCount?: number
  showLogo?: boolean
  titleClassName?: string
  actions?: ReactNode
  className?: string
  children?: ReactNode
}) {
  return (
    <header className={cn('border-b border-border', className)}>
      <div className="mx-auto box-content flex h-14 max-w-page items-center gap-1 px-5">
        {showLogo && (
          <span className="mr-1.5 hidden items-center border-r border-border pr-3.5 sm:flex">
            <Link route="home" className="rounded-xs">
              <Logo />
            </Link>
          </span>
        )}
        <p className={cn('flex-1 text-base leading-none font-semibold', titleClassName)}>{title}</p>
        {step && stepCount && (
          <span className="font-mono text-meta leading-none font-medium text-muted-foreground">
            <span className="sr-only">Langkah </span>
            {`${step}/${stepCount}`}
          </span>
        )}
        {actions}
      </div>
      {children && <div className="mx-auto box-content max-w-page px-5">{children}</div>}
    </header>
  )
}
