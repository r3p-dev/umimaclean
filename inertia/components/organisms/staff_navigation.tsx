import type { ComponentType, SVGProps } from 'react'
import {
  IconArrowDownLeft,
  IconArrowUpRight,
  IconHome,
  IconHomeFilled,
  IconMenu2,
  IconWashMachine,
} from '@tabler/icons-react'
import { cn } from 'cn'
import Logo from '~/components/atoms/logo'
import NavigationItem from '~/components/molecules/navigation_item'
import { STAFF_NAVIGATION, type StaffSection } from '~/lib/navigation/staff_links'

type Icon = ComponentType<SVGProps<SVGSVGElement>>

const ICONS: Record<StaffSection, [Icon, Icon]> = {
  beranda: [IconHome, IconHomeFilled],
  jemput: [IconArrowUpRight, IconArrowUpRight],
  proses: [IconWashMachine, IconWashMachine],
  antar: [IconArrowDownLeft, IconArrowDownLeft],
  lainnya: [IconMenu2, IconMenu2],
}

export function StaffSidebar({ active }: { active: StaffSection }) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-18 shrink-0 flex-col gap-1 self-start border-r border-border bg-card px-3 py-5 sm:flex lg:w-58">
      <div className="flex items-center gap-2 pb-5 max-lg:justify-center lg:px-2.5 lg:pt-1">
        <span className="hidden flex-col gap-2 lg:flex">
          <Logo className="h-12" />
          <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Aplikasi Staf
          </span>
        </span>
        <Logo variant="icon" className="size-8 lg:hidden" />
      </div>
      <nav aria-label="Navigasi staf" className="flex flex-col gap-1">
        {STAFF_NAVIGATION.map((item) => {
          const isActive = item.key === active
          const [Outline, Filled] = ICONS[item.key]
          const ItemIcon = isActive ? Filled : Outline
          return (
            <NavigationItem
              key={item.key}
              item={item}
              isActive={isActive}
              className={cn(
                'flex h-11 items-center gap-2.5 rounded-md text-sm leading-none max-lg:justify-center lg:px-2.5',
                isActive
                  ? 'bg-accent font-semibold text-accent-foreground'
                  : 'font-medium text-foreground hover:bg-accent'
              )}
            >
              <ItemIcon className="size-5 shrink-0" />
              <span className="sr-only lg:not-sr-only lg:flex-1">{item.label}</span>
            </NavigationItem>
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
      className="sticky bottom-0 z-30 grid h-16 grid-cols-5 border-t border-border bg-card sm:hidden"
    >
      {STAFF_NAVIGATION.map((item) => {
        const isActive = item.key === active
        const [Outline, Filled] = ICONS[item.key]
        const ItemIcon = isActive ? Filled : Outline
        return (
          <NavigationItem
            key={item.key}
            item={item}
            isActive={isActive}
            className={cn(
              'flex flex-col items-center justify-center gap-1 text-xs leading-none',
              isActive ? 'font-bold text-accent-foreground' : 'font-medium text-foreground/80'
            )}
          >
            <span
              className={cn('flex h-6.5 items-center rounded-full px-3.5', isActive && 'bg-accent')}
            >
              <ItemIcon className="size-5.5" />
            </span>
            {item.label}
          </NavigationItem>
        )
      })}
    </nav>
  )
}
