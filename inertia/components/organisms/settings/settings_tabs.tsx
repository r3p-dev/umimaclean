import { Link } from '@adonisjs/inertia/react'
import { cn } from 'cn'

const TABS = [
  { key: 'store', label: 'Toko & Jadwal', route: 'admin.settings.store' },
  { key: 'areas', label: 'Area Layanan', route: 'admin.areas.index' },
] as const

export type SettingsTabKey = (typeof TABS)[number]['key']

export default function SettingsTabs({ active }: { active: SettingsTabKey }) {
  return (
    <nav
      aria-label="Bagian pengaturan"
      className="flex gap-2 overflow-x-auto border-b border-border"
    >
      {TABS.map((tab) => {
        const isActive = tab.key === active
        return (
          <Link
            key={tab.key}
            route={tab.route}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              '-mb-px inline-flex min-h-11 shrink-0 items-center border-b-2 px-3 text-sm no-underline transition-colors',
              isActive
                ? 'border-primary font-semibold text-primary'
                : 'border-transparent font-medium text-muted-foreground hover:border-border hover:text-foreground'
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
