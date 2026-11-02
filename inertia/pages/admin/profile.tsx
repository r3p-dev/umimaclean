import { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import { IconDevices, IconLogout } from '@tabler/icons-react'
import type { Data } from '@generated/data'
import { urlFor } from '~/client'
import InitialsAvatar from '~/components/atoms/initials_avatar'
import AdminPageHeader from '~/components/organisms/admin_page_header'
import PasswordForm from '~/components/organisms/profile/password_form'
import AdminLayout from '~/components/templates/admin_layout'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { initialsOf } from '~/lib/navigation/account_links'
import { signOut } from '~/lib/shared/auth'
import { formatDate } from '~/lib/shared/date'

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
          <Card role="region" aria-labelledby="owner-identity">
            <CardContent>
              <div className="flex items-center gap-3.5">
                <InitialsAvatar initials={initialsOf(user.name)} size="lg" />
                <div className="min-w-0 flex-1">
                  <CardTitle as="h2" id="owner-identity">
                    {user.name}
                  </CardTitle>
                  <CardDescription>{user.roleLabel}</CardDescription>
                </div>
              </div>
              <dl className="divide-y divide-border border-t border-border">
                <div className="flex justify-between gap-3 py-3">
                  <dt className="text-muted-foreground">Nomor WhatsApp</dt>
                  <dd className="font-mono">{user.phone}</dd>
                </div>
                <div className="flex justify-between gap-3 py-3 last:pb-0">
                  <dt className="text-muted-foreground">Bergabung</dt>
                  <dd>{formatDate(user.joinedOn, 'full')}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          <Card role="region" aria-labelledby="owner-devices">
            <CardHeader>
              <CardTitle as="h2" id="owner-devices">
                Perangkat & sesi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground-secondary">
                Akun ini masuk di {deviceCount} perangkat. Perangkat lain harus masuk lagi setelah
                dikeluarkan.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="desktop" onPress={signOutOthers} isPending={isBusy}>
                <IconDevices className="size-4.5" />
                Keluar dari Perangkat Lain
              </Button>
              <Button variant="destructive-outline" size="desktop" onPress={signOut}>
                <IconLogout className="size-4.5" />
                Keluar
              </Button>
            </CardFooter>
          </Card>
        </div>
        <PasswordForm action={urlFor('admin.password.update')} />
      </div>
    </AdminLayout>
  )
}
