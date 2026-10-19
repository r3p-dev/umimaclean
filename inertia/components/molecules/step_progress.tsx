import { ORDER_STEPS } from '~/lib/order/draft'
import { cn } from '~/lib/shared/utils'

export default function StepProgress({
  current,
  className,
}: {
  current: number
  className?: string
}) {
  return (
    <ol aria-label="Langkah pemesanan" className={cn('grid grid-cols-3 gap-1.5', className)}>
      {ORDER_STEPS.map((step, index) => (
        <li
          key={step.route}
          aria-current={index === current ? 'step' : undefined}
          className="flex flex-col gap-1.5"
        >
          <span
            aria-hidden="true"
            className={cn('h-1 rounded-xs', index <= current ? 'bg-primary' : 'bg-chart-track')}
          />
          <span
            className={cn(
              'text-[11.5px] leading-[1.2]',
              index === current
                ? 'font-semibold text-info-foreground'
                : index < current
                  ? 'font-medium text-foreground'
                  : 'font-medium text-muted-foreground'
            )}
          >
            {step.label}
          </span>
        </li>
      ))}
    </ol>
  )
}
