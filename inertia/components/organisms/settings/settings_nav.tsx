import type { ReactNode } from 'react'
import { Link } from '@adonisjs/inertia/react'
import { IconChevronDown } from '@tabler/icons-react'
import { cn } from 'cn'
import { Button, Disclosure, DisclosurePanel } from 'react-aria-components'

const SECTIONS = [
  { key: 'store', label: 'Toko', route: 'admin.settings.store' },
  { key: 'slots', label: 'Slot penjemputan', route: 'admin.settings.slots' },
  { key: 'areas', label: 'Area layanan', route: 'admin.areas.index' },
] as const

export type SettingsSection = (typeof SECTIONS)[number]['key']

function SectionLinks({ active }: { active: SettingsSection }) {
  return (
    <ul className="flex flex-col gap-1">
      {SECTIONS.map((section) => {
        const isActive = section.key === active
        return (
          <li key={section.key}>
            <Link
              route={section.route}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex min-h-11 items-center rounded-md px-3 text-sm no-underline transition-colors',
                isActive
                  ? 'bg-accent font-semibold text-accent-foreground'
                  : 'font-medium text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {section.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

// The settings pages' own navigation: a column on wide screens, a collapsible list on phones.
export default function SettingsNav({
  active,
  children,
}: {
  active: SettingsSection
  children: ReactNode
}) {
  const current = SECTIONS.find((section) => section.key === active)!
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
      <nav
        aria-label="Bagian pengaturan"
        className="hidden w-52 shrink-0 lg:sticky lg:top-6 lg:block"
      >
        <SectionLinks active={active} />
      </nav>
      <nav
        aria-label="Bagian pengaturan"
        className="rounded-lg border border-border bg-card lg:hidden"
      >
        {/* A plain disclosure, not the accordion: its trigger would be a heading inside a menu. */}
        <Disclosure className="group">
          <Button
            slot="trigger"
            className="flex min-h-12 w-full items-center justify-between gap-2 rounded-lg px-4 py-3 text-left text-base leading-none font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Bagian: {current.label}
            <IconChevronDown
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground group-data-expanded:rotate-180"
            />
          </Button>
          <DisclosurePanel className="px-2 pb-2">
            <SectionLinks active={active} />
          </DisclosurePanel>
        </Disclosure>
      </nav>
      <div className="flex min-w-0 flex-1 flex-col gap-6">{children}</div>
    </div>
  )
}
