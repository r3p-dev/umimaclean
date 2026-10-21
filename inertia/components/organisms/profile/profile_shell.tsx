import { type ComponentType, type ReactNode, type SVGProps } from 'react'
import { Link } from '@adonisjs/inertia/react'
import { IconLock, IconLogout, IconMapPin, IconUser } from '@tabler/icons-react'
import { Button } from '~/components/ui/button'
import { PROFILE_NAV, type ProfileSection } from '~/lib/navigation/account_links'
import { signOut } from '~/lib/shared/auth'
import { cn } from '~/lib/shared/utils'

const ICONS: Record<ProfileSection, ComponentType<SVGProps<SVGSVGElement>>> = {
  profil: IconUser,
  alamat: IconMapPin,
  keamanan: IconLock,
}

export default function ProfileShell({
  active,
  title,
  back,
  children,
}: {
  active: ProfileSection
  title: string
  back?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="mx-auto box-content max-w-page px-5 pt-4 lg:pt-10">
      {back && <div className="lg:hidden">{back}</div>}
      <p
        aria-hidden="true"
        className="text-[34px] leading-[1.15] font-bold tracking-[-0.02em] max-lg:hidden"
      >
        Akun Saya
      </p>
      <div className="mt-2 lg:mt-7 lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start lg:gap-10">
        <nav aria-label="Menu akun" className="sticky top-22 flex flex-col gap-1 max-lg:hidden">
          {PROFILE_NAV.map((item) => {
            const Icon = ICONS[item.key]
            const isActive = item.key === active
            return (
              <Link
                key={item.key}
                route={item.route}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex h-11 items-center gap-3 rounded-md px-3 text-[15px] leading-none no-underline hover:no-underline',
                  isActive
                    ? 'bg-accent font-semibold text-accent-foreground hover:text-accent-foreground'
                    : 'font-medium text-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <Icon className="size-5 shrink-0" />
                {item.label}
              </Link>
            )
          })}
          <span className="my-2 border-t border-border" />
          <Button
            variant="ghost"
            onPress={signOut}
            className="h-11 justify-start gap-3 px-3 text-[15px] font-medium text-destructive-text"
          >
            <IconLogout className="size-5 shrink-0" />
            Keluar
          </Button>
        </nav>
        <div className="flex min-w-0 flex-col">
          <h1 className="text-[28px] leading-[1.15] font-bold tracking-[-0.02em] lg:text-[22px] lg:leading-[1.25] lg:tracking-[-0.01em]">
            {title}
          </h1>
          {children}
        </div>
      </div>
    </div>
  )
}
