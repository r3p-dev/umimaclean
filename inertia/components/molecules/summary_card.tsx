import { type ReactNode } from 'react'
import { Link } from '@adonisjs/inertia/react'
import Overline from '~/components/atoms/overline'
import { cn } from '~/lib/shared/utils'

export default function SummaryCard({
  title,
  editHref,
  editLabel,
  media,
  className,
  children,
}: {
  title: string
  editHref: string
  editLabel: string
  media?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card">
      {media}
      <div className={cn('flex flex-col gap-2.5 p-4', className)}>
        <div className="flex items-center justify-between">
          <Overline as="h2">{title}</Overline>
          <Link
            href={editHref}
            aria-label={editLabel}
            className="box-content inline-flex min-h-11 items-center py-2 text-sm leading-none font-semibold text-primary underline-offset-3 hover:text-primary-hover hover:underline"
          >
            Ubah
          </Link>
        </div>
        {children}
      </div>
    </section>
  )
}
