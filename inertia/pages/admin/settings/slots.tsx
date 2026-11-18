import { useState, type ReactNode } from 'react'
import { Head } from '@inertiajs/react'
import type { Data } from '@generated/data'
import OwnerPageHeader from '~/components/organisms/owner_page_header'
import PickupSlotsCard from '~/components/organisms/settings/pickup_slots_card'
import SettingsNav from '~/components/organisms/settings/settings_nav'
import OwnerLayout from '~/components/templates/owner_layout'

export default function AdminPickupSlots({
  slots,
  openDays,
}: {
  slots: Data.PickupSlot[]
  openDays: number[]
}) {
  const [day, setDay] = useState(openDays[0] ?? 1)

  return (
    <>
      <Head title="Slot Penjemputan" />
      <OwnerPageHeader
        title="Slot Penjemputan"
        status="Atur slot dan kapasitas penjemputan untuk setiap hari buka."
      />

      <SettingsNav active="slots">
        {/* A new key after a save or a day change gives the card a fresh draft. */}
        <PickupSlotsCard
          key={`${day}:${JSON.stringify(slots)}`}
          slots={slots}
          openDays={openDays}
          day={day}
          onDayChange={setDay}
        />
      </SettingsNav>
    </>
  )
}

AdminPickupSlots.layout = (page: ReactNode) => (
  <OwnerLayout active="pengaturan" title="Slot Penjemputan">
    {page}
  </OwnerLayout>
)
