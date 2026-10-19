import type { PickupDay } from '~/lib/order/schedule'
import { cn } from '~/lib/shared/utils'

export default function PickupDateOption({
  day,
  checked,
  onPick,
}: {
  day: PickupDay
  checked: boolean
  onPick: () => void
}) {
  const off = !day.available
  const muted = !checked && !off && 'text-muted-foreground'

  return (
    <label
      className={cn(
        'flex h-17 flex-col items-center justify-center gap-0.75 rounded-md has-focus-visible:focus-ring',
        checked
          ? 'border-2 border-primary bg-accent text-info-foreground'
          : off
            ? 'cursor-not-allowed border border-border bg-disabled text-disabled-foreground'
            : 'cursor-pointer border border-border-strong bg-card text-foreground hover:bg-accent'
      )}
    >
      <input
        type="radio"
        name="pickup-date"
        value={day.iso}
        checked={checked}
        disabled={off}
        onChange={onPick}
        aria-label={`${day.dayLong}, ${day.dayNumber} ${day.month}${off ? ', penuh' : ''}`}
        className="sr-only"
      />
      <span
        className={cn('text-xs leading-none', checked ? 'font-semibold' : 'font-medium', muted)}
      >
        {day.dayShort}
      </span>
      <span className={cn('text-lg leading-none', checked ? 'font-bold' : 'font-semibold')}>
        {day.dayNumber}
      </span>
      <span
        className={cn(
          'text-[10.5px] leading-none',
          checked ? 'font-semibold' : 'font-medium',
          muted
        )}
      >
        {off ? 'Penuh' : day.isTomorrow ? 'Besok' : day.month}
      </span>
    </label>
  )
}
