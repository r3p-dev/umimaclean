import { cn } from 'cn'
import { OrderStageOf, STAGE_TONES, stageProgressSteps, type OrderStatus } from '~/lib/order_status'

export default function OrderStageProgress({ status }: { status: OrderStatus }) {
  const stage = OrderStageOf[status]
  const steps = stageProgressSteps(status)
  const current = steps.find((step) => step.state === 'current')

  return (
    <div
      role="img"
      aria-label={
        current
          ? `Kemajuan pesanan: tahap ${current.label}`
          : stage === 'selesai'
            ? 'Kemajuan pesanan: selesai'
            : 'Kemajuan pesanan: dibatalkan'
      }
      className="grid grid-cols-5 gap-2"
    >
      {steps.map((step) => (
        <div key={step.key} className="flex flex-col gap-1.5">
          <span
            className={cn(
              'h-1.5 rounded-full',
              step.state === 'done'
                ? 'bg-primary'
                : step.state === 'current'
                  ? STAGE_TONES[stage].dot
                  : 'bg-border'
            )}
          />
          <span
            className={cn(
              'text-xs leading-tight',
              step.state === 'current' ? 'font-bold text-foreground' : 'font-medium',
              step.state === 'upcoming' ? 'text-muted-foreground' : 'text-foreground'
            )}
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  )
}
