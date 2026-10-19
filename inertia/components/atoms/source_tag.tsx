import { cn } from '~/lib/shared/utils'

export default function SourceTag({
  store,
  shape = 'tag',
  className,
}: {
  store: boolean
  shape?: 'tag' | 'pill'
  className?: string
}) {
  return (
    <span
      data-surface={store ? 'inverse' : undefined}
      className={cn(
        'inline-flex shrink-0 items-center text-2xs leading-none font-bold tracking-[0.04em] whitespace-nowrap',
        shape === 'tag' ? 'h-badge rounded-sm px-2' : 'h-5.5 rounded-pill px-2',
        store
          ? 'bg-surface-inverse text-surface-inverse-foreground'
          : 'bg-muted text-foreground-secondary',
        className
      )}
    >
      {store ? 'OFFLINE · TOKO' : 'ONLINE'}
    </span>
  )
}
