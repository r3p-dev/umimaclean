import { type ComponentType, type SVGProps } from 'react'
import { Link } from '@adonisjs/inertia/react'
import {
  IconArrowDownLeft,
  IconArrowUpRight,
  IconHome,
  IconHomeFilled,
  IconMenu2,
  IconWashMachine,
} from '@tabler/icons-react'
import Logo from '~/components/atoms/logo'
import { STAFF_NAV, type StaffSection } from '~/lib/navigation/staff_links'
import type { StaffCounts } from '~/lib/staff/summary'
import { cn } from '~/lib/shared/utils'

type Icon = ComponentType<SVGProps<SVGSVGElement>>

const ICONS: Record<StaffSection, [Icon, Icon]> = {
  beranda: [IconHome, IconHomeFilled],
  jemput: [IconArrowUpRight, IconArrowUpRight],
  proses: [IconWashMachine, IconWashMachine],
  antar: [IconArrowDownLeft, IconArrowDownLeft],
  lainnya: [IconMenu2, IconMenu2],
}

function countFor(key: StaffSection, counts: StaffCounts) {
  if (key === 'jemput' || key === 'proses' || key === 'antar') {
    return counts[key] || null
  }
  return null
}

export function StaffSidebar({ active, counts }: { active: StaffSection; counts: StaffCounts }) {
  return (
    <aside className="sticky top-0 hidden h-dvh flex-col gap-1 self-start border-r border-border bg-card px-3 py-4.5 sm:flex">
      <div className="flex items-center gap-2 pb-4.5 max-lg:justify-center lg:px-2.5 lg:pt-1">
        <span className="hidden flex-col gap-2 lg:flex">
          <Logo size="md" />
          <span className="text-2xs leading-[1.2] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            Aplikasi Staf
          </span>
        </span>
        <span className="flex lg:hidden">
          <Logo variant="icon" size="md" />
        </span>
      </div>
      <nav aria-label="Navigasi staf" className="flex flex-col gap-1">
        {STAFF_NAV.map((item) => {
          const isActive = item.key === active
          const [Outline, Filled] = ICONS[item.key]
          const Icon = isActive ? Filled : Outline
          const count = countFor(item.key, counts)
          return (
            <Link
              key={item.key}
              route={item.route}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex h-11 items-center gap-2.5 rounded-md text-sm leading-none no-underline hover:no-underline max-lg:justify-center lg:px-2.5',
                isActive
                  ? 'bg-accent font-semibold text-accent-foreground hover:text-accent-foreground'
                  : 'font-medium text-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon className="size-5 shrink-0" />
              <span className="hidden flex-1 lg:inline">{item.label}</span>
              {count !== null && (
                <span className="hidden text-xs leading-none font-semibold text-muted-foreground lg:inline">
                  {count}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

export function StaffTabBar({ active }: { active: StaffSection }) {
  return (
    <nav
      aria-label="Navigasi staf"
      className="sticky bottom-0 z-30 grid h-tab-bar grid-cols-5 border-t border-border bg-card sm:hidden"
    >
      {STAFF_NAV.map((item) => {
        const isActive = item.key === active
        const [Outline, Filled] = ICONS[item.key]
        const Icon = isActive ? Filled : Outline
        return (
          <Link
            key={item.key}
            route={item.route}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex flex-col items-center justify-center gap-1 text-[11.5px] leading-none no-underline hover:no-underline',
              isActive
                ? 'font-bold text-info-foreground hover:text-info-foreground'
                : 'font-medium text-foreground-secondary hover:text-foreground-secondary'
            )}
          >
            <span
              className={cn('flex h-6.5 items-center rounded-pill px-3.5', isActive && 'bg-accent')}
            >
              <Icon className="size-5.5" />
            </span>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
