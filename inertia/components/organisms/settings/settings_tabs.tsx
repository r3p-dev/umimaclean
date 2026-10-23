import { Link } from '@adonisjs/inertia/react'
import { cn } from '~/lib/shared/utils'

const TABS = [
  { key: 'staff', label: 'Akun staf', route: 'admin.staff' },
  { key: 'store', label: 'Toko & pembayaran', route: 'admin.store' },
  { key: 'areas', label: 'Area layanan', route: 'admin.areas' },
] as const

export default function SettingsTabs({ active }: { active: (typeof TABS)[number]['key'] }) {
  return (
    <nav
      aria-label="Bagian pengaturan"
      className="flex gap-1 overflow-x-auto border-b border-border"
    >
      {TABS.map((tab) => {
        const isActive = tab.key === active
        return (
          <Link
            key={tab.key}
            route={tab.route}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              '-mb-px box-content flex h-btn-desktop shrink-0 items-center border-b-2 px-3.5 text-sm leading-none no-underline hover:bg-accent hover:no-underline',
              isActive
                ? 'border-primary font-semibold text-foreground hover:text-foreground'
                : 'border-b-0 font-medium text-foreground-secondary hover:text-foreground-secondary'
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
