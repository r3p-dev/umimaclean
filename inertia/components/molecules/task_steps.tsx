import { IconCheck } from '@tabler/icons-react'
import { cn } from '~/lib/shared/utils'

export default function TaskSteps({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol aria-label="Tahap tugas" className="mt-1 grid grid-cols-4">
      {steps.map((label, index) => {
        const state = index < current ? 'done' : index === current ? 'current' : 'upcoming'
        return (
          <li
            key={label}
            aria-current={state === 'current' ? 'step' : undefined}
            className="flex min-w-0 flex-col gap-1.5"
          >
            <div className="flex items-center">
              <span
                className={cn(
                  'flex size-5.5 shrink-0 items-center justify-center rounded-full',
                  state === 'done' && 'bg-primary text-surface-inverse-foreground',
                  state === 'current' &&
                    'border-6 border-primary bg-card shadow-[0_0_0_4px_var(--accent-strong)]',
                  state === 'upcoming' && 'border-2 border-input bg-card'
                )}
              >
                {state === 'done' && <IconCheck className="size-3.75" />}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  'mx-1.5 h-0.5 flex-1',
                  index < current ? 'bg-primary' : 'bg-border-strong',
                  index === steps.length - 1 && 'invisible'
                )}
              />
            </div>
            <span
              className={cn(
                'pr-1 text-xs leading-[1.25]',
                state === 'current' ? 'font-bold' : 'font-medium',
                state === 'upcoming' ? 'text-muted-foreground' : 'text-foreground'
              )}
            >
              <span className="sr-only">
                {state === 'done'
                  ? 'Selesai: '
                  : state === 'current'
                    ? 'Saat ini: '
                    : 'Berikutnya: '}
              </span>
              {label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
