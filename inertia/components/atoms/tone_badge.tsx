import { type ReactNode } from 'react'
import type { StatusTone } from '~/lib/tracking/status'
import { cn } from '~/lib/shared/utils'

type BadgeTone = StatusTone | 'ok' | 'off' | 'warn' | 'info'

const TONES: Record<BadgeTone, string> = {
  jemput: 'bg-status-jemput-bg text-status-jemput-fg',
  periksa: 'bg-status-periksa-bg text-status-periksa-fg',
  bayar: 'bg-status-bayar-bg text-status-bayar-fg',
  cuci: 'bg-status-cuci-bg text-status-cuci-fg',
  antar: 'bg-status-antar-bg text-status-antar-fg',
  selesai: 'bg-status-selesai-bg text-status-selesai-fg',
  batal: 'bg-status-batal-bg text-status-batal-fg',
  ok: 'bg-success text-success-foreground',
  off: 'bg-muted text-foreground-secondary',
  warn: 'bg-attention text-attention-foreground',
  info: 'bg-info text-info-foreground',
}

export default function ToneBadge({
  tone,
  hasDot = false,
  className,
  children,
}: {
  tone: BadgeTone
  hasDot?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex h-badge w-fit shrink-0 items-center gap-1.5 rounded-pill px-2.25 text-caption leading-none font-semibold whitespace-nowrap',
        TONES[tone],
        className
      )}
    >
      {hasDot && <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-current" />}
      {children}
    </span>
  )
}
