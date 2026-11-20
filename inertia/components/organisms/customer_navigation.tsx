import type { ComponentType, SVGProps } from 'react'
import { Link } from '@adonisjs/inertia/react'
import { router, usePage } from '@inertiajs/react'
import {
  IconChevronDown,
  IconCirclePlus,
  IconCirclePlusFilled,
  IconHome,
  IconHomeFilled,
  IconLogout,
  IconReceipt,
  IconReceiptFilled,
  IconUser,
  IconUserFilled,
} from '@tabler/icons-react'
import { cn } from 'cn'
import Logo from '~/components/atoms/logo'
import NavigationItem from '~/components/molecules/navigation_item'
import { urlFor } from '~/client'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown_menu'
import { CUSTOMER_NAVIGATION, type CustomerSection } from '~/lib/navigation/customer_links'

type Icon = ComponentType<SVGProps<SVGSVGElement>>

const ICONS: Record<CustomerSection, [Icon, Icon]> = {
  beranda: [IconHome, IconHomeFilled],
  pesan: [IconCirclePlus, IconCirclePlusFilled],
  riwayat: [IconReceipt, IconReceiptFilled],
  profil: [IconUser, IconUserFilled],
}

export function CustomerHeader({ active }: { active: CustomerSection }) {
  const user = usePage().props.user

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-5 sm:h-16">
        <Link route="customer.home" className="rounded-sm">
          <Logo />
        </Link>
        <nav aria-label="Navigasi akun" className="hidden h-full items-stretch gap-1 sm:flex">
          {CUSTOMER_NAVIGATION.filter((item) => item.key !== 'profil').map((item) => {
            const isActive = item.key === active
            return (
              <NavigationItem
                key={item.key}
                item={item}
                isActive={isActive}
                className={cn(
                  'flex items-center border-b-2 px-3 text-base leading-none',
                  isActive
                    ? 'border-primary font-semibold text-foreground'
                    : 'border-transparent font-medium text-foreground/80 hover:text-foreground'
                )}
              >
                {item.label}
              </NavigationItem>
            )
          })}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          {/* The account menu: Profil and Keluar (D107). */}
          {user && (
            <DropdownMenuTrigger>
              <Button
                variant="ghost"
                className={cn('h-11 gap-2 px-2', active === 'profil' && 'bg-muted')}
              >
                <span
                  aria-hidden="true"
                  className="flex size-9 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground"
                >
                  {user.initials}
                </span>
                {/* The name is the button's label: read out on phones, shown from sm up. */}
                <span className="sr-only text-sm font-medium sm:not-sr-only">{user.fullName}</span>
                <span className="sr-only">, menu akun</span>
                <IconChevronDown aria-hidden="true" className="size-4 text-muted-foreground" />
              </Button>
              <DropdownMenu placement="bottom end" className="w-auto min-w-44">
                <DropdownMenuItem onAction={() => router.visit(urlFor('customer.profile.show'))}>
                  <IconUser aria-hidden="true" />
                  Profil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onAction={() => router.post(urlFor('session.destroy'))}>
                  <IconLogout aria-hidden="true" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenu>
            </DropdownMenuTrigger>
          )}
        </div>
      </div>
    </header>
  )
}

export function CustomerTabBar({ active }: { active: CustomerSection }) {
  return (
    <nav
      aria-label="Navigasi akun"
      className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-around border-t border-border bg-card pb-[env(safe-area-inset-bottom)] sm:hidden"
    >
      {CUSTOMER_NAVIGATION.map((item) => {
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
              isActive ? 'font-semibold text-primary' : 'font-medium text-foreground/80'
            )}
          >
            <ItemIcon className="size-6" />
            {item.label}
          </NavigationItem>
        )
      })}
    </nav>
  )
}
