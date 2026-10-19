import { type ComponentType, type SVGProps } from 'react'
import { Link } from '@adonisjs/inertia/react'
import { IconChevronRight } from '@tabler/icons-react'
import { cn } from '~/lib/shared/utils'

export default function MenuRow({
  href,
  icon: Icon,
  title,
  description,
  highlight = false,
}: {
  href: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  title: string
  description: string
  highlight?: boolean
}) {
  return (
    <Link
      href={href}
      className="box-content grid min-h-16 grid-cols-[40px_minmax(0,1fr)_20px] items-center gap-3 border-b border-border px-4 py-2.5 text-foreground no-underline last:border-b-0 hover:bg-accent hover:text-foreground hover:no-underline"
    >
      <span
        className={cn(
          'flex size-10 items-center justify-center rounded-md',
          highlight ? 'bg-accent text-info-foreground' : 'bg-muted text-foreground-secondary'
        )}
      >
        <Icon className="size-5.5" />
      </span>
      <span>
        <span className="block text-[15px] leading-[1.3] font-semibold">{title}</span>
        <span className="block text-meta leading-[1.4] text-muted-foreground">{description}</span>
      </span>
      <IconChevronRight className="size-5 text-muted-foreground" />
    </Link>
  )
}
