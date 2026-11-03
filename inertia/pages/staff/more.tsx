import { Head } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import {
  IconBuildingStore,
  IconChevronRight,
  IconHistory,
  IconLogout,
  IconUserCog,
} from '@tabler/icons-react'
import { urlFor } from '~/client'
import InitialsAvatar from '~/components/atoms/initials_avatar'
import StaffTopBar from '~/components/organisms/staff_top_bar'
import StaffLayout from '~/components/templates/staff_layout'
import { Card, CardContent } from '~/components/ui/card'
import { signOut, useAccount } from '~/lib/shared/auth'
import { cn } from '~/lib/shared/utils'

export default function StaffMore() {
  const account = useAccount()
  const menu = [
    {
      href: urlFor('staff.walk_in'),
      icon: IconBuildingStore,
      title: 'Transaksi Offline',
      description: 'Pelanggan datang langsung ke toko',
      isHighlighted: true,
    },
    {
      href: urlFor('staff.history'),
      icon: IconHistory,
      title: 'Riwayat',
      description: 'Tugas dan transaksi yang Anda catat',
      isHighlighted: false,
    },
    {
      href: urlFor('staff.profile'),
      icon: IconUserCog,
      title: 'Profil & Pengaturan',
      description: 'Kata sandi dan perangkat',
      isHighlighted: false,
    },
  ]

  return (
    <StaffLayout active="lainnya">
      <Head title="Lainnya" />
      <StaffTopBar title="Lainnya" />
      <div className="mx-auto flex w-full max-w-160 flex-col gap-3.5 p-4">
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <InitialsAvatar initials={account.firstName[0] ?? ''} size="md" tone="neutral" />
              <div className="min-w-0 flex-1">
                <p className="text-md font-semibold">{account.name}</p>
                <p className="text-meta text-muted-foreground">{account.roleLabel}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent data-bleed>
            <nav aria-label="Menu lainnya" className="divide-y divide-border">
              {menu.map(({ href, icon: Icon, title, description, isHighlighted }) => (
                <Link
                  key={title}
                  href={href}
                  className="box-content grid min-h-16 grid-cols-[40px_minmax(0,1fr)_20px] items-center gap-3 px-(--card-spacing) py-2.5 text-foreground no-underline hover:bg-accent hover:text-foreground hover:no-underline"
                >
                  <span
                    className={cn(
                      'flex size-10 items-center justify-center rounded-md',
                      isHighlighted
                        ? 'bg-accent text-info-foreground'
                        : 'bg-muted text-foreground-secondary'
                    )}
                  >
                    <Icon className="size-5.5" />
                  </span>
                  <span>
                    <span className="block text-[15px] leading-[1.3] font-semibold">{title}</span>
                    <span className="block text-meta leading-[1.4] text-muted-foreground">
                      {description}
                    </span>
                  </span>
                  <IconChevronRight className="size-5 text-muted-foreground" />
                </Link>
              ))}
            </nav>
          </CardContent>
        </Card>
        <button
          type="button"
          onClick={signOut}
          className="box-content flex h-cta items-center justify-center gap-2 rounded-lg border border-border bg-card text-[15px] leading-none font-semibold text-destructive-text hover:bg-destructive-subtle"
        >
          <IconLogout className="size-5" />
          Keluar
        </button>
      </div>
    </StaffLayout>
  )
}
