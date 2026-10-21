import { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import { IconDevices, IconLogout } from '@tabler/icons-react'
import type { Data } from '@generated/data'
import { urlFor } from '~/client'
import InitialsAvatar from '~/components/atoms/initials_avatar'
import Overline from '~/components/atoms/overline'
import AdminPageHeader from '~/components/organisms/admin_page_header'
import PasswordForm from '~/components/organisms/profile/password_form'
import AdminLayout from '~/components/templates/admin_layout'
import { Button } from '~/components/ui/button'
import { initialsOf } from '~/lib/navigation/account_links'
import { signOut } from '~/lib/shared/auth'
import { formatDate } from '~/lib/shared/date'

const CARD = 'flex flex-col gap-4 rounded-lg border border-border bg-card p-5'

export default function AdminProfile({
  user,
  deviceCount,
}: {
  user: Data.User
  deviceCount: number
}) {
  const [isBusy, setBusy] = useState(false)

  function signOutOthers() {
    router.post(
      urlFor('admin.sign_out_others'),
      {},
      { preserveScroll: true, onStart: () => setBusy(true), onFinish: () => setBusy(false) }
    )
  }

  return (
    <AdminLayout active="profil" title="Profil">
      <Head title="Profil" />
      <AdminPageHeader title="Profil" />
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <section className={CARD} aria-labelledby="owner-identity">
            <div className="flex items-center gap-3.5">
              <InitialsAvatar initials={initialsOf(user.name)} size="lg" />
              <div className="min-w-0 flex-1">
                <h2 id="owner-identity" className="text-lg leading-[1.25] font-bold">
                  {user.name}
                </h2>
                <p className="text-note leading-[1.4] text-foreground-secondary">
                  {user.roleLabel}
                </p>
              </div>
            </div>
            <dl className="flex flex-col gap-3 text-sm leading-[1.4]">
              <div className="flex justify-between gap-3 border-t border-border pt-2">
                <dt className="text-muted-foreground">Nomor WhatsApp</dt>
                <dd className="font-mono">{user.phone}</dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-border pt-2">
                <dt className="text-muted-foreground">Bergabung</dt>
                <dd>{formatDate(user.joinedOn, 'full')}</dd>
              </div>
            </dl>
          </section>
          <section className={CARD} aria-labelledby="owner-devices">
            <Overline as="h2" id="owner-devices">
              Perangkat & sesi
            </Overline>
            <p className="text-sm leading-normal text-foreground-secondary">
              Akun ini masuk di {deviceCount} perangkat. Perangkat lain harus masuk lagi setelah
              dikeluarkan.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="desktop" onPress={signOutOthers} isPending={isBusy}>
                <IconDevices className="size-4.5" />
                Keluar dari Perangkat Lain
              </Button>
              <Button variant="destructive-outline" size="desktop" onPress={signOut}>
                <IconLogout className="size-4.5" />
                Keluar
              </Button>
            </div>
          </section>
        </div>
        <PasswordForm action={urlFor('admin.password.update')} className={CARD} />
      </div>
    </AdminLayout>
  )
}
