import { cn } from '~/lib/shared/utils'

export default function SourceTag({
  isInStore,
  shape = 'tag',
  className,
}: {
  isInStore: boolean
  shape?: 'tag' | 'pill'
  className?: string
}) {
  return (
    <span
      data-surface={isInStore ? 'inverse' : undefined}
      className={cn(
        'inline-flex shrink-0 items-center text-2xs leading-none font-bold tracking-[0.04em] whitespace-nowrap',
        shape === 'tag' ? 'h-badge rounded-sm px-2' : 'h-5.5 rounded-pill px-2',
        isInStore
          ? 'bg-surface-inverse text-surface-inverse-foreground'
          : 'bg-muted text-foreground-secondary',
        className
      )}
    >
      {isInStore ? 'OFFLINE · TOKO' : 'ONLINE'}
    </span>
  )
}
