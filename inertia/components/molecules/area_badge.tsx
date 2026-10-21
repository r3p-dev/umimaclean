import { IconCheck, IconHelpCircle, IconLoader2, IconX } from '@tabler/icons-react'
import type { AreaTone } from '~/lib/location/service_area'
import { cn } from '~/lib/shared/utils'

const BADGES = {
  loading: {
    text: 'Mengecek area…',
    className: 'bg-muted text-foreground-secondary',
    Icon: IconLoader2,
  },
  covered: {
    text: 'Masuk area layanan',
    className: 'bg-success text-success-foreground',
    Icon: IconCheck,
  },
  outside: {
    text: 'Di luar area layanan',
    className: 'bg-destructive-subtle text-destructive-text',
    Icon: IconX,
  },
  unknown: {
    text: 'Area belum terbaca',
    className: 'bg-attention text-attention-foreground',
    Icon: IconHelpCircle,
  },
}

export default function AreaBadge({
  tone,
  isLoading,
}: {
  tone: AreaTone | null
  isLoading: boolean
}) {
  const badge =
    BADGES[isLoading ? 'loading' : tone === 'covered' || tone === 'outside' ? tone : 'unknown']

  return (
    <span
      className={cn(
        'inline-flex h-badge items-center gap-1.25 self-start rounded-pill px-2.25 text-caption leading-none font-semibold',
        badge.className
      )}
    >
      <badge.Icon className={cn('size-3.75', isLoading && 'animate-spin')} />
      {badge.text}
    </span>
  )
}
