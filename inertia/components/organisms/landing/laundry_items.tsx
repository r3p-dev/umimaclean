import type { ComponentType, SVGProps } from 'react'
import { IconBackpack, IconHelmet, IconShoe } from '@tabler/icons-react'

const ITEMS: { name: string; description: string; icon: ComponentType<SVGProps<SVGSVGElement>> }[] =
  [
    { name: 'Sepatu', description: 'Sneakers, kanvas, kulit, suede', icon: IconShoe },
    { name: 'Tas', description: 'Ransel, tote, kulit', icon: IconBackpack },
    { name: 'Helm', description: 'Half-face, full-face · bawa langsung ke toko', icon: IconHelmet },
  ]

export default function LaundryItems() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-4 px-5 pt-10 pb-2">
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Yang kami cuci</h2>
      <ul className="grid gap-3 sm:grid-cols-3">
        {ITEMS.map(({ name, description, icon: Icon }) => (
          <li
            key={name}
            className="flex items-center gap-4 rounded-xl border border-border bg-background p-4 sm:flex-col sm:items-start sm:p-5"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Icon className="size-7" />
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-base font-semibold">{name}</span>
              <span className="text-sm text-muted-foreground">{description}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
