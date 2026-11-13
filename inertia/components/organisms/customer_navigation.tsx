import type { ComponentType, SVGProps } from 'react'
import CsrfField from '~/components/atoms/csrf_field'
import { Form, Link } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'
import {
  IconCirclePlus,
  IconCirclePlusFilled,
  IconHome,
  IconHomeFilled,
  IconLogout,
  IconPlus,
  IconReceipt,
  IconReceiptFilled,
  IconUser,
  IconUserFilled,
} from '@tabler/icons-react'
import { cn } from 'cn'
import Logo from '~/components/atoms/logo'
import NavigationItem from '~/components/molecules/navigation_item'
import { buttonVariants } from '~/components/ui/button'
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
        <Link route="dashboard" className="rounded-sm">
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
          <span
            aria-disabled="true"
            className={cn(
              buttonVariants({
                className: 'hidden h-11 gap-2 px-4 text-sm lg:inline-flex',
              })
            )}
          >
            <IconPlus className="size-4.5" />
            Pesan Penjemputan
          </span>
          {user && (
            <span className="hidden items-center gap-2 text-sm font-medium sm:inline-flex">
              <span className="flex size-9 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                {user.initials}
              </span>
              {user.fullName}
            </span>
          )}
          <Form route="session.destroy">
            <CsrfField />
            <button
              type="submit"
              className={cn(
                buttonVariants({
                  variant: 'outline',
                  className: 'h-11 gap-2 px-3 text-sm',
                })
              )}
            >
              <IconLogout className="size-4.5" />
              Keluar
            </button>
          </Form>
        </div>
      </div>
    </header>
  )
}

export function CustomerTabBar({ active }: { active: CustomerSection }) {
  return (
    <nav
      aria-label="Navigasi akun"
      className="fixed inset-x-0 bottom-0 z-30 grid h-16 grid-cols-4 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] sm:hidden"
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
