import { TONE_CLASSES } from '~/components/atoms/status_tone'
import type { StatusTone, StepState } from '~/lib/tracking/status'
import { cn } from '~/lib/shared/utils'

export default function PhaseProgress({
  phases,
  tone,
  className,
}: {
  phases: { label: string; state: StepState }[]
  tone: StatusTone
  className?: string
}) {
  const current = phases.find((phase) => phase.state === 'current')

  return (
    <div
      role="img"
      aria-label={current ? `Kemajuan pesanan: tahap ${current.label}` : 'Kemajuan pesanan'}
      className={cn('grid grid-cols-5 gap-1.5', className)}
    >
      {phases.map((phase) => (
        <div key={phase.label} className="flex flex-col gap-1.75">
          <span
            className={cn(
              'h-1.5 rounded-xs',
              phase.state === 'done'
                ? 'bg-primary'
                : phase.state === 'current'
                  ? TONE_CLASSES[tone].dot
                  : 'bg-border-strong'
            )}
          />
          <span
            className={cn(
              'text-xs leading-[1.2]',
              phase.state === 'current' ? 'font-bold' : 'font-medium',
              phase.state === 'upcoming' ? 'text-muted-foreground' : 'text-foreground'
            )}
          >
            {phase.label}
          </span>
        </div>
      ))}
    </div>
  )
}
