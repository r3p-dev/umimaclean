import { type ReactNode } from 'react'
import { IconArrowLeft } from '@tabler/icons-react'
import { LinkButton } from '~/components/ui/button'
import { cn } from '~/lib/shared/utils'

export default function StaffTopBar({
  title,
  meta,
  subtitle,
  back,
  actions,
  variant = 'section',
}: {
  title: string
  meta?: ReactNode
  subtitle?: string
  back?: { href: string; label: string }
  actions?: ReactNode
  variant?: 'section' | 'detail'
}) {
  const isDetail = variant === 'detail'

  return (
    <header
      className={cn(
        'box-content flex min-h-15 items-center border-b border-border bg-card pr-4',
        isDetail ? 'gap-1.5 pl-2' : back ? 'gap-1 pl-5' : 'gap-2 pl-5'
      )}
    >
      {back && (
        <LinkButton
          variant="ghost"
          size="icon"
          className={cn('shrink-0', !isDetail && '-ml-2.5')}
          href={back.href}
          aria-label={back.label}
        >
          <IconArrowLeft className="size-6" />
        </LinkButton>
      )}
      <div className={cn('min-w-0', (isDetail || !back) && 'flex-1')}>
        <h1
          className={cn(
            'font-bold',
            isDetail ? 'text-[17px] leading-[1.2]' : 'text-[19px] leading-none'
          )}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="font-mono text-xs leading-[1.3] font-medium text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
      {meta && (
        <span className="text-right text-meta leading-[1.3] font-medium text-muted-foreground">
          {meta}
        </span>
      )}
      {actions}
    </header>
  )
}
