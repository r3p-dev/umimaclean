import PickupDateOption from '~/components/molecules/pickup_date_option'
import PickupSlotOption from '~/components/molecules/pickup_slot_option'
import { PICKUP_SLOTS, type PickupDay } from '~/lib/order/schedule'
import { cn } from '~/lib/shared/utils'

export default function PickupSchedulePicker({
  days,
  day,
  slot,
  onPickDay,
  onPickSlot,
  className,
}: {
  days: PickupDay[]
  day: PickupDay
  slot: number
  onPickDay: (day: PickupDay) => void
  onPickSlot: (slot: number) => void
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-3 pt-7', className)}>
      <h2 className="text-[17px] leading-[1.3] font-semibold">Jadwal penjemputan</h2>
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
    </div>
  )
}
