import { IconCircle, IconCircleDot } from '@tabler/icons-react'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { PICKUP_SLOTS, type PickupDay } from '~/lib/order/schedule'
import { cn } from '~/lib/shared/utils'

function PickupDateOption({
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

function PickupSlotOption({
  label,
  isChecked,
  isFull,
  onPick,
}: {
  label: string
  isChecked: boolean
  isFull: boolean
  onPick: () => void
}) {
  return (
    <label
      className={cn(
        'flex h-13 w-full items-center justify-between rounded-md text-[15px] leading-none has-focus-visible:focus-ring',
        isChecked
          ? 'border-2 border-primary bg-accent px-3.5 font-semibold text-accent-foreground'
          : isFull
            ? 'cursor-not-allowed border border-border bg-disabled px-3.75 font-medium text-disabled-foreground'
            : 'cursor-pointer border border-border-strong bg-card px-3.75 font-medium hover:bg-accent'
      )}
    >
      <input
        type="radio"
        name="pickup-slot"
        value={label}
        checked={isChecked}
        disabled={isFull}
        onChange={onPick}
        aria-label={`${label}${isFull ? ', penuh' : ''}`}
        className="sr-only"
      />
      {label.replace('–', ' – ')}
      {isFull ? (
        <span className="text-caption leading-none font-medium">Penuh</span>
      ) : isChecked ? (
        <IconCircleDot className="size-5 text-primary" />
      ) : (
        <IconCircle className="size-5 text-icon-muted" />
      )}
    </label>
  )
}

export default function PickupSchedulePicker({
  days,
  day,
  slot,
  onPickDay,
  onPickSlot,
}: {
  days: PickupDay[]
  day: PickupDay
  slot: number
  onPickDay: (day: PickupDay) => void
  onPickSlot: (slot: number) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2">Jadwal penjemputan</CardTitle>
      </CardHeader>
      <CardContent>
        <fieldset>
          <legend className="sr-only">Tanggal penjemputan</legend>
          <div className="grid grid-cols-5 gap-2">
            {days.map((option) => (
              <PickupDateOption
                key={option.iso}
                day={option}
                isChecked={option.iso === day.iso}
                onPick={() => onPickDay(option)}
              />
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="sr-only">Jam penjemputan</legend>
          <div className="flex flex-col gap-2">
            {PICKUP_SLOTS.map((label, index) =>
              day.slots[index]?.isOpen === false ? null : (
                <PickupSlotOption
                  key={label}
                  label={label}
                  isChecked={index === slot}
                  isFull={day.fullSlots.includes(index)}
                  onPick={() => onPickSlot(index)}
                />
              )
            )}
          </div>
        </fieldset>
      </CardContent>
    </Card>
  )
}
