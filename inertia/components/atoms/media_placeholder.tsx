import { cn } from '~/lib/shared/utils'

export default function MediaPlaceholder({
  label,
  size = 'default',
  className,
}: {
  label: string
  size?: 'default' | 'sm'
  className?: string
}) {
  const isSmall = size === 'sm'

  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        'stripes box-content flex items-end',
        isSmall ? 'rounded-md p-1.5 [--stripe:8px]' : 'rounded-lg p-3',
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'font-mono font-medium text-foreground-secondary',
          isSmall
            ? 'text-[9.5px] leading-[1.2]'
            : 'rounded-xs bg-surface-glass px-1.75 py-1 text-2xs'
        )}
      >
        {label}
      </span>
    </div>
  )
}
