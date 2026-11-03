import { TONE_CLASSES } from '~/components/atoms/status_tone'
import { toneOfStatus, type OrderStatus } from '~/lib/tracking/status'
import { cn } from '~/lib/shared/utils'

const SIZES = {
  default: 'h-badge px-2.5 text-caption',
  lg: 'h-6.5 px-2.5 text-meta',
}

export default function StatusBadge({
  status,
  size = 'default',
}: {
  status: OrderStatus
  size?: keyof typeof SIZES
}) {
  const tone = TONE_CLASSES[toneOfStatus(status)]

  return (
    <span
      className={cn(
        'inline-flex w-fit items-center gap-1.5 rounded-pill leading-none font-semibold whitespace-nowrap',
        SIZES[size],
        tone.surface,
        tone.ink
      )}
    >
      <span aria-hidden="true" className={cn('size-[7px] rounded-full', tone.dot)} />
      {status}
    </span>
  )
}
