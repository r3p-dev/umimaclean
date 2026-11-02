import PickupDateOption from '~/components/molecules/pickup_date_option'
import PickupSlotOption from '~/components/molecules/pickup_slot_option'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { PICKUP_SLOTS, type PickupDay } from '~/lib/order/schedule'

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
