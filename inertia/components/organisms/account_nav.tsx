import { type ComponentType, type SVGProps } from 'react'
import { Link } from '@adonisjs/inertia/react'
import {
  IconChevronDown,
  IconCirclePlus,
  IconCirclePlusFilled,
  IconHome,
  IconHomeFilled,
  IconLogout,
  IconMapPin,
  IconPlus,
  IconReceipt,
  IconReceiptFilled,
  IconUser,
  IconUserFilled,
} from '@tabler/icons-react'
import { urlFor } from '~/client'
import InitialsAvatar from '~/components/atoms/initials_avatar'
import Logo from '~/components/atoms/logo'
import { Button, LinkButton } from '~/components/ui/button'
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown_menu'
import { ACCOUNT_NAV, initialsOf, type AccountSection } from '~/lib/navigation/account_links'
import { signOut } from '~/lib/shared/auth'
import { cn } from '~/lib/shared/utils'

type Icon = ComponentType<SVGProps<SVGSVGElement>>

const ICONS: Record<AccountSection, [Icon, Icon]> = {
  beranda: [IconHome, IconHomeFilled],
  pesan: [IconCirclePlus, IconCirclePlusFilled],
  riwayat: [IconReceipt, IconReceiptFilled],
  profil: [IconUser, IconUserFilled],
}

export function AccountHeader({
  active,
  name,
  firstName,
}: {
  active: AccountSection
  name: string
  firstName: string
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card">
      <div className="mx-auto box-content flex h-14 max-w-page items-center gap-6 px-5 sm:h-16">
        <Link route="customer.home" className="rounded-xs">
          <Logo />
        </Link>
        <nav aria-label="Navigasi akun" className="hidden h-full items-stretch gap-1 sm:flex">
          {ACCOUNT_NAV.filter((item) => item.key !== 'profil').map((item) => {
            const isActive = item.key === active
            return (
              <Link
                key={item.key}
                route={item.route}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center border-b-2 px-3 text-[15px] leading-none no-underline hover:no-underline',
                  isActive
                    ? 'border-primary font-semibold text-foreground hover:text-foreground'
                    : 'border-transparent font-medium text-foreground-secondary hover:text-foreground'
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <LinkButton
            size="desktop"
            href={urlFor('customer.order.create')}
            className="hidden gap-2 px-4 lg:inline-flex"
          >
            <IconPlus className="size-4.5" />
            Pesan Penjemputan
          </LinkButton>
          <DropdownMenuTrigger>
            <Button
              variant="outline"
              aria-label={`Menu akun ${name}`}
              className="h-11.5 gap-2 rounded-pill pr-3 pl-1 max-sm:pr-1 max-sm:border-transparent"
            >
              <InitialsAvatar initials={initialsOf(name)} />
              <span className="hidden text-sm font-medium sm:inline">{firstName}</span>
              <IconChevronDown className="hidden size-4.5 sm:block" />
            </Button>
            <DropdownMenu aria-label="Menu akun">
              <DropdownMenuItem href={urlFor('customer.profile.show')} textValue="Profil">
                <IconUser className="size-5" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuItem href={urlFor('customer.addresses.index')} textValue="Alamat">
                <IconMapPin className="size-5" />
                Alamat
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onAction={signOut} textValue="Keluar">
                <IconLogout className="size-5" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenu>
          </DropdownMenuTrigger>
        </div>
      </div>
    </header>
  )
}

export function AccountTabBar({ active }: { active: AccountSection }) {
  return (
    <nav
      aria-label="Navigasi akun"
      className="fixed inset-x-0 bottom-0 z-30 grid h-tab-bar grid-cols-4 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] sm:hidden"
    >
      {ACCOUNT_NAV.map((item) => {
        const isActive = item.key === active
        const [Outline, Filled] = ICONS[item.key]
        const ItemIcon = isActive ? Filled : Outline
        return (
          <Link
            key={item.key}
            route={item.route}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex flex-col items-center justify-center gap-1 text-xs leading-none no-underline hover:no-underline',
              isActive
                ? 'font-semibold text-primary hover:text-primary'
                : 'font-medium text-foreground-secondary hover:text-foreground'
            )}
          >
            <ItemIcon className="size-6" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
