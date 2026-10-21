import { Head } from '@inertiajs/react'
import { IconBuildingStore, IconHistory, IconLogout, IconUserCog } from '@tabler/icons-react'
import { urlFor } from '~/client'
import InitialsAvatar from '~/components/atoms/initials_avatar'
import MenuRow from '~/components/molecules/menu_row'
import StaffTopBar from '~/components/organisms/staff_top_bar'
import StaffLayout from '~/components/templates/staff_layout'
import { signOut, useAccount } from '~/lib/shared/auth'

export default function StaffMore() {
  const account = useAccount()
  return (
    <StaffLayout active="lainnya">
      <Head title="Lainnya" />
      <StaffTopBar title="Lainnya" />
      <div className="mx-auto flex w-full max-w-160 flex-col gap-3.5 p-4">
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3.5">
          <InitialsAvatar initials={account.firstName[0] ?? ''} size="md" tone="neutral" />
          <div className="min-w-0 flex-1">
            <p className="text-[15.5px] leading-[1.3] font-semibold">{account.name}</p>
            <p className="text-meta leading-[1.4] text-muted-foreground">{account.roleLabel}</p>
          </div>
        </div>
        <nav
          aria-label="Menu lainnya"
          className="overflow-hidden rounded-lg border border-border bg-card"
        >
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
