import { cn } from '~/lib/shared/utils'

export default function BarSteps({
  steps,
  current,
  label,
  currentClassName = 'bg-chart-2',
  className,
}: {
  steps: string[]
  current: number
  label: string
  currentClassName?: string
  className?: string
}) {
  return (
    <ol aria-label={label} className={cn('grid gap-1.5', className)}>
      {steps.map((step, index) => {
        const state = index < current ? 'done' : index === current ? 'current' : 'upcoming'
        return (
          <li
            key={step}
            aria-current={state === 'current' ? 'step' : undefined}
            className="flex min-w-0 flex-col gap-1.5"
          >
            <span
              aria-hidden="true"
              className={cn(
                'h-1 rounded-xs',
                state === 'done' && 'bg-primary',
                state === 'current' && currentClassName,
                state === 'upcoming' && 'bg-chart-track'
              )}
            />
            <span
              className={cn(
                'text-[11.5px] leading-[1.2] wrap-anywhere',
                state === 'current' ? 'font-bold' : 'font-medium',
                state === 'upcoming' ? 'text-muted-foreground' : 'text-foreground'
              )}
            >
              {step}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
