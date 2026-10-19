import { type ComponentType, type ReactNode, type SVGProps } from 'react'
import { cn } from '~/lib/shared/utils'

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  title: string
  description: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center gap-2.5 px-2 py-4 text-center', className)}>
      <Icon className="size-8 text-icon-muted" />
      <p className="text-[15px] leading-[1.3] font-semibold">{title}</p>
      <p className="text-note leading-normal text-pretty text-muted-foreground">{description}</p>
      {action}
    </div>
  )
}
