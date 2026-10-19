import { IconBackpack, IconHelmet, IconShoe } from '@tabler/icons-react'
import QuantityStepper from '~/components/molecules/quantity_stepper'
import type { ItemCounts } from '~/lib/order/items'

const ITEMS = [
  { key: 'sepatu', label: 'Sepatu', icon: IconShoe },
  { key: 'tas', label: 'Tas', icon: IconBackpack },
  { key: 'helm', label: 'Helm', icon: IconHelmet },
] as const

export default function ItemCounterList({
  items,
  onChange,
}: {
  items: ItemCounts
  onChange: (items: ItemCounts) => void
}) {
  return (
    <div className="pt-2.5">
      {ITEMS.map(({ key, label, icon }) => (
        <QuantityStepper
          key={key}
          label={label}
          icon={icon}
          value={items[key]}
          onChange={(value) => onChange({ ...items, [key]: value })}
        />
      ))}
    </div>
  )
}
