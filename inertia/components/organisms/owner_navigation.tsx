import { useState, type ComponentType, type SVGProps } from 'react'
import CsrfField from '~/components/atoms/csrf_field'
import { Form } from '@adonisjs/inertia/react'
import {
  IconArrowsExchange,
  IconChartBar,
  IconChartLine,
  IconHistoryToggle,
  IconLogout,
  IconMenu2,
  IconReceipt,
  IconSettings,
  IconTag,
  IconUserCircle,
  IconUsers,
  IconX,
} from '@tabler/icons-react'
import { cn } from 'cn'
import Logo from '~/components/atoms/logo'
import NavigationItem from '~/components/molecules/navigation_item'
import { Button } from '~/components/ui/button'
import { Sheet, SheetClose, SheetTitle } from '~/components/ui/sheet'
import { OWNER_NAVIGATION, type OwnerSection } from '~/lib/navigation/owner_links'

const ICONS: Record<OwnerSection, ComponentType<SVGProps<SVGSVGElement>>> = {
  ringkasan: IconChartLine,
  pesanan: IconReceipt,
  rekonsiliasi: IconArrowsExchange,
  layanan: IconTag,
  pelanggan: IconUsers,
  laporan: IconChartBar,
  aktivitas: IconHistoryToggle,
  pengaturan: IconSettings,
  profil: IconUserCircle,
}

const ITEM = 'flex h-11 w-full items-center gap-2.5 rounded-md text-sm leading-none'

function itemClass(isActive: boolean, isCompact: boolean) {
  return cn(
    ITEM,
    isCompact ? 'max-lg:justify-center lg:px-2.5' : 'px-2.5',
    isActive
      ? 'bg-sidebar-accent font-semibold text-sidebar-accent-foreground'
      : 'font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
  )
}

function OwnerNavigationItems({ active, isCompact }: { active: OwnerSection; isCompact: boolean }) {
  const labelClass = isCompact ? 'sr-only lg:not-sr-only' : undefined

  return (
    <>
      <nav aria-label="Navigasi owner" className="flex flex-col gap-1">
        {OWNER_NAVIGATION.map((item) => {
          const ItemIcon = ICONS[item.key]
          return (
            <NavigationItem
              key={item.key}
              item={item}
              isActive={item.key === active}
              className={itemClass(item.key === active, isCompact)}
            >
              <ItemIcon className="size-5 shrink-0" />
              <span className={labelClass}>{item.label}</span>
            </NavigationItem>
          )
        })}
      </nav>
      <div className="mt-auto flex flex-col gap-1 border-t border-sidebar-border pt-3">
        <NavigationItem
          item={{ key: 'profil', label: 'Profil' }}
          isActive={active === 'profil'}
          className={itemClass(active === 'profil', isCompact)}
        >
          <IconUserCircle className="size-5 shrink-0" />
          <span className={labelClass}>Profil</span>
        </NavigationItem>
        <Form route="session.destroy">
          <CsrfField />
          <button type="submit" className={itemClass(false, isCompact)}>
            <IconLogout className="size-5 shrink-0" />
            <span className={labelClass}>Keluar</span>
          </button>
        </Form>
      </div>
    </>
  )
}

export function OwnerSidebar({ active }: { active: OwnerSection }) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-18 shrink-0 flex-col gap-1 self-start bg-sidebar px-3 py-5 text-sidebar-foreground sm:flex lg:w-58">
      <div className="hidden flex-col items-start gap-2 px-2.5 pt-1 pb-5 text-sidebar-accent-foreground lg:flex">
        <Logo className="h-12" />
        <span className="text-xs font-semibold tracking-widest text-sidebar-foreground uppercase">
          Dasbor Owner
        </span>
      </div>
      <div className="flex justify-center pt-0.5 pb-4 text-sidebar-accent-foreground lg:hidden">
        <Logo variant="icon" className="size-8" />
      </div>
      <OwnerNavigationItems active={active} isCompact />
    </aside>
  )
}

export function OwnerTopBar({ active, title }: { active: OwnerSection; title: string }) {
  const [isOpen, setOpen] = useState(false)

  return (
    <div className="flex h-14 items-center gap-2 bg-sidebar pr-3 pl-1 text-sidebar-accent-foreground sm:hidden">
      <Button
        variant="ghost"
        size="icon-lg"
        aria-label="Buka menu navigasi"
        onPress={() => setOpen(true)}
        className="text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      >
        <IconMenu2 className="size-6" />
      </Button>
      <Sheet
        isOpen={isOpen}
        onOpenChange={setOpen}
        side="left"
        showCloseButton={false}
        className="gap-1 bg-sidebar px-3 pt-3.5 pb-5 text-sidebar-foreground"
      >
        <div className="flex items-start justify-between gap-2 pt-1 pb-4.5 pl-2.5 text-sidebar-accent-foreground">
          <div className="flex flex-col gap-2">
            <Logo className="h-12" />
            <SheetTitle className="text-xs font-semibold tracking-widest text-sidebar-foreground uppercase">
              Dasbor Owner
            </SheetTitle>
          </div>
          <SheetClose
            variant="ghost"
            size="icon-lg"
            aria-label="Tutup menu"
            className="text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <IconX className="size-5.5" />
          </SheetClose>
        </div>
        <OwnerNavigationItems active={active} isCompact={false} />
      </Sheet>
      <Logo variant="icon" className="size-6" />
      <p className="min-w-0 flex-1 truncate text-base font-semibold">{title}</p>
    </div>
  )
}
