import { useState, type ComponentType, type SVGProps } from 'react'
import { Link } from '@adonisjs/inertia/react'
import {
  IconChartBar,
  IconChartLine,
  IconHistoryToggle,
  IconMenu2,
  IconReceipt,
  IconSettings,
  IconTag,
  IconUsers,
  IconX,
} from '@tabler/icons-react'
import Logo from '~/components/atoms/logo'
import { Button } from '~/components/ui/button'
import { Sheet, SheetClose, SheetTitle } from '~/components/ui/sheet'
import { ADMIN_NAV, type AdminSection } from '~/lib/navigation/admin_links'
import { cn } from '~/lib/shared/utils'

const ICONS: Record<AdminSection, ComponentType<SVGProps<SVGSVGElement>>> = {
  ringkasan: IconChartLine,
  pesanan: IconReceipt,
  layanan: IconTag,
  pelanggan: IconUsers,
  laporan: IconChartBar,
  aktivitas: IconHistoryToggle,
  pengaturan: IconSettings,
}

function NavItems({
  active,
  compact,
  onNavigate,
}: {
  active: AdminSection
  compact: boolean
  onNavigate?: () => void
}) {
  return ADMIN_NAV.map((item) => {
    const on = item.key === active
    const Icon = ICONS[item.key]
    return (
      <Link
        key={item.key}
        route={item.route}
        aria-label={item.label}
        aria-current={on ? 'page' : undefined}
        onClick={onNavigate}
        className={cn(
          'flex h-btn-desktop items-center gap-2.5 rounded-md text-sm leading-none no-underline hover:no-underline',
          compact ? 'max-lg:justify-center lg:px-2.5' : 'px-2.5',
          on
            ? 'bg-sidebar-accent font-semibold text-sidebar-accent-foreground hover:text-sidebar-accent-foreground'
            : 'font-medium text-sidebar-foreground hover:bg-sidebar-accent-hover hover:text-sidebar-accent-foreground'
        )}
      >
        <Icon className="size-5 shrink-0" />
        <span className={cn(compact && 'hidden lg:inline')}>{item.label}</span>
      </Link>
    )
  })
}

export function AdminSidebar({ active }: { active: AdminSection }) {
  return (
    <aside
      data-surface="inverse sidebar"
      aria-label="Navigasi utama"
      className="sticky top-0 hidden h-dvh flex-col gap-1 self-start bg-sidebar px-3 py-5 sm:flex"
    >
      <Link
        route="admin.summary"
        aria-label="Umima — ke Ringkasan"
        className="hidden flex-col items-start gap-2 rounded-md px-2.5 pt-1 pb-5 no-underline lg:flex"
      >
        <Logo size="md" tone="inverse" />
        <span className="text-2xs leading-[1.2] font-semibold tracking-[0.08em] text-sidebar-muted-foreground uppercase">
          Dasbor Owner
        </span>
      </Link>
      <Link
        route="admin.summary"
        aria-label="Umima — ke Ringkasan"
        className="flex justify-center rounded-md pt-0.5 pb-4 no-underline lg:hidden"
      >
        <Logo variant="icon" size="md" tone="inverse" />
      </Link>
      <NavItems active={active} compact />
    </aside>
  )
}

export function AdminTopBar({ active, title }: { active: AdminSection; title: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      data-surface="inverse"
      className="flex h-14 items-center gap-2 bg-surface-inverse pr-3 pl-1 text-surface-inverse-foreground sm:hidden"
    >
      <Button
        variant="ghost"
        size="icon"
        aria-label="Buka menu navigasi"
        aria-expanded={open}
        onPress={() => setOpen(true)}
        className="text-surface-inverse-foreground hover:bg-sidebar-accent-hover data-pressed:bg-sidebar-accent"
      >
        <IconMenu2 className="size-6" />
      </Button>
      <Sheet
        isOpen={open}
        onOpenChange={setOpen}
        data-surface="inverse sidebar"
        className="gap-1 bg-sidebar px-3 pt-3.5 pb-5"
      >
        <div className="flex items-start justify-between gap-2 pt-1 pb-4.5 pl-2.5">
          <div className="flex flex-col gap-2">
            <Logo size="md" tone="inverse" />
            <SheetTitle className="text-2xs leading-[1.2] font-semibold tracking-[0.08em] text-sidebar-muted-foreground uppercase">
              Dasbor Owner
            </SheetTitle>
          </div>
          <SheetClose
            variant="ghost"
            size="icon"
            aria-label="Tutup menu"
            className="text-surface-inverse-foreground hover:bg-sidebar-accent-hover data-pressed:bg-sidebar-accent"
          >
            <IconX className="size-5.5" />
          </SheetClose>
        </div>
        <nav aria-label="Navigasi utama" className="flex flex-col gap-1">
          <NavItems active={active} compact={false} onNavigate={() => setOpen(false)} />
        </nav>
      </Sheet>
      <Logo variant="icon" size="sm" tone="inverse" decorative />
      <p className="min-w-0 flex-1 truncate text-base leading-[1.2] font-semibold">{title}</p>
    </div>
  )
}
