import { type ReactNode } from 'react'
import { IconArrowDown, IconArrowUp, IconSelector } from '@tabler/icons-react'
import { cn } from '~/lib/shared/utils'

export default function SortHeader({
  sort,
  align = 'left',
  onSort,
  className,
  children,
}: {
  sort: 'ascending' | 'descending' | 'none'
  align?: 'left' | 'right'
  onSort: () => void
  className?: string
  children: ReactNode
}) {
  const Icon =
    sort === 'ascending' ? IconArrowUp : sort === 'descending' ? IconArrowDown : IconSelector

  return (
    <th
      scope="col"
      aria-sort={sort}
      className={cn(
        'px-2 py-1 font-semibold',
        align === 'right' ? 'text-right' : 'text-left',
        className
      )}
    >
      <button
        type="button"
        onClick={onSort}
        className={cn(
          '-mx-1.5 inline-flex min-h-btn-compact items-center gap-1 rounded-inner px-1.5 whitespace-nowrap uppercase hover:bg-muted hover:text-foreground',
          sort !== 'none' && 'text-foreground',
          align === 'right' && 'justify-end'
        )}
      >
        {children}
        <Icon className={cn('size-4', sort !== 'none' ? 'text-primary' : 'text-icon-muted')} />
      </button>
    </th>
  )
}
