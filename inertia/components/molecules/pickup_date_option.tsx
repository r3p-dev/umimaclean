import type { PickupDay } from '~/lib/order/schedule'
import { cn } from '~/lib/shared/utils'

export default function PickupDateOption({
  day,
  isChecked,
  onPick,
}: {
  day: PickupDay
  isChecked: boolean
  onPick: () => void
}) {
  const isUnavailable = !day.isAvailable
  const muted = !isChecked && !isUnavailable && 'text-muted-foreground'

  return (
    <label
      className={cn(
        'flex h-17 flex-col items-center justify-center gap-0.75 rounded-md has-focus-visible:focus-ring',
        isChecked
          ? 'border-2 border-primary bg-accent text-info-foreground'
          : isUnavailable
            ? 'cursor-not-allowed border border-border bg-disabled text-disabled-foreground'
            : 'cursor-pointer border border-border-strong bg-card text-foreground hover:bg-accent'
      )}
    >
      <input
        type="radio"
        name="pickup-date"
        value={day.iso}
        checked={isChecked}
        disabled={isUnavailable}
        onChange={onPick}
        aria-label={`${day.dayLong}, ${day.dayNumber} ${day.month}${isUnavailable ? ', penuh' : ''}`}
        className="sr-only"
      />
      <span
        className={cn('text-xs leading-none', isChecked ? 'font-semibold' : 'font-medium', muted)}
      >
        {day.dayShort}
      </span>
      <span className={cn('text-lg leading-none', isChecked ? 'font-bold' : 'font-semibold')}>
        {day.dayNumber}
      </span>
      <span
        className={cn(
          'text-[10.5px] leading-none',
          isChecked ? 'font-semibold' : 'font-medium',
          muted
        )}
      >
        {isUnavailable ? 'Penuh' : day.isTomorrow ? 'Besok' : day.month}
      </span>
    </label>
  )
}
