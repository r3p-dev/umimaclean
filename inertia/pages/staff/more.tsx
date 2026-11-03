import { Head } from '@inertiajs/react'
import { IconBuildingStore, IconHistory, IconLogout, IconUserCog } from '@tabler/icons-react'
import { urlFor } from '~/client'
import InitialsAvatar from '~/components/atoms/initials_avatar'
import MenuRow from '~/components/molecules/menu_row'
import StaffTopBar from '~/components/organisms/staff_top_bar'
import StaffLayout from '~/components/templates/staff_layout'
import { Card, CardContent } from '~/components/ui/card'
import { signOut, useAccount } from '~/lib/shared/auth'

export default function StaffMore() {
  const account = useAccount()
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
              <MenuRow
                href={urlFor('staff.walk_in')}
                icon={IconBuildingStore}
                title="Transaksi Offline"
                description="Pelanggan datang langsung ke toko"
                isHighlighted
              />
              <MenuRow
                href={urlFor('staff.history')}
                icon={IconHistory}
                title="Riwayat"
                description="Tugas dan transaksi yang Anda catat"
              />
              <MenuRow
                href={urlFor('staff.profile')}
                icon={IconUserCog}
                title="Profil & Pengaturan"
                description="Kata sandi dan perangkat"
              />
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
