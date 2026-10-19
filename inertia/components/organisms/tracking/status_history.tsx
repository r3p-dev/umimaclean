import { useState } from 'react'
import { IconCheck, IconX } from '@tabler/icons-react'
import { TONE_CLASSES } from '~/components/atoms/status_tone'
import ProofPhoto from '~/components/molecules/proof_photo'
import type { HistoryEntry, TrackingView } from '~/lib/tracking/status'
import { cn } from '~/lib/shared/utils'

function StepDot({ entry }: { entry: HistoryEntry }) {
  const tone = TONE_CLASSES[entry.tone]
  if (entry.cancelledEntry || entry.state === 'done') {
    const Icon = entry.cancelledEntry ? IconX : IconCheck
    return (
      <span
        className={cn(
          'grid size-5.5 shrink-0 place-items-center rounded-full text-surface-inverse-foreground',
          entry.cancelledEntry ? tone.dot : 'bg-primary'
        )}
      >
        <Icon className="size-4.25" />
      </span>
    )
  }
  if (entry.state === 'current') {
    return (
      <span
        className={cn('size-5.5 shrink-0 rounded-full border-6 bg-card', tone.ring, tone.halo)}
      />
    )
  }
  return <span className="size-5.5 shrink-0 rounded-full border-2 border-border-strong bg-card" />
}

export default function StatusHistory({
  view,
  className,
  id,
}: {
  view: TrackingView
  className?: string
  id?: string
}) {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <section
      id={id}
      role="tabpanel"
      className={cn('rounded-lg border border-border bg-card px-4 pt-4.5 pb-1', className)}
    >
      <div className="mb-5 flex items-baseline justify-between gap-3">
        <h2 className="text-[17px] leading-[1.3] font-semibold">Riwayat status</h2>
        <span className="text-meta leading-[1.3] font-medium text-muted-foreground">
          {view.historyCount}
        </span>
      </div>
      <ol>
        {view.history.map((entry) => {
          const current = entry.state === 'current'
          const tone = TONE_CLASSES[entry.tone]
          const proof =
            entry.proof && (entry.proof.available || !view.cancelled) ? entry.proof : null
          return (
            <li key={entry.key} className="grid grid-cols-[22px_minmax(0,1fr)] gap-x-3.5">
              <div className="flex flex-col items-center">
                <StepDot entry={entry} />
                {!entry.last && (
                  <span
                    className={cn(
                      'my-1 min-h-4 w-0.5 flex-1',
                      entry.state === 'done' ? 'bg-primary' : 'bg-border-strong'
                    )}
                  />
                )}
              </div>
              <div
                className={cn(
                  'flex min-w-0 flex-col',
                  current
                    ? cn('-mt-2.75 mb-4.5 gap-1.5 rounded-md px-3.5 pt-2.75 pb-3', tone.surface)
                    : 'gap-1 pb-5'
                )}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span
                      className={cn(
                        current
                          ? 'text-[17px] font-bold'
                          : entry.state === 'done'
                            ? 'text-[15px] font-semibold'
                            : 'text-[15px] font-medium text-muted-foreground',
                        'leading-5.5'
                      )}
                    >
                      {entry.label}
                    </span>
                    {entry.isCurrent && (
                      <span
                        className={cn(
                          'inline-flex h-5 items-center rounded-pill bg-card px-2 text-2xs leading-none font-bold tracking-[0.03em] uppercase',
                          tone.ink
                        )}
                      >
                        Sekarang
                      </span>
                    )}
                  </span>
                  {entry.state !== 'upcoming' && entry.time && (
                    <span
                      className={cn(
                        'text-meta leading-5.5 tabular-nums',
                        current ? cn('font-semibold', tone.ink) : 'text-muted-foreground'
                      )}
                    >
                      {entry.isCurrent ? `Sejak ${entry.time}` : entry.time}
                    </span>
                  )}
                </div>
                {entry.description && (
                  <p
                    className={cn(
                      current
                        ? 'text-[14.5px] leading-normal text-foreground'
                        : cn(
                            'text-note leading-[1.45]',
                            entry.state === 'upcoming'
                              ? 'text-muted-foreground'
                              : 'text-foreground-secondary'
                          )
                    )}
                  >
                    {entry.description}
                  </p>
                )}
                {proof && (
                  <ProofPhoto
                    proof={proof}
                    expanded={expanded === proof.key}
                    onToggle={() => setExpanded((open) => (open === proof.key ? null : proof.key))}
                  />
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
