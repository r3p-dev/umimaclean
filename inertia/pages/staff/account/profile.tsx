import { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import type { Data } from '@generated/data'
import { IconDeviceMobile, IconDevices, IconLock, IconLogout } from '@tabler/icons-react'
import { urlFor } from '~/client'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import InitialsAvatar from '~/components/atoms/initials_avatar'
import ToneBadge from '~/components/atoms/tone_badge'
import ChoicePills from '~/components/molecules/choice_pills'
import StaffTopBar from '~/components/organisms/staff_top_bar'
import StaffLayout from '~/components/templates/staff_layout'
import PasswordForm from '~/components/organisms/profile/password_form'
import { MAP_APPS, preferences } from '~/lib/staff/preferences'
import { formatDate } from '~/lib/shared/date'
import { initialsOf } from '~/lib/navigation/account_links'
import { signOut } from '~/lib/shared/auth'
import { cn } from '~/lib/shared/utils'

export default function StaffProfile({
  user,
  deviceCount,
}: {
  user: Data.User
  deviceCount: number
}) {
  const prefs = preferences.use()
  const [isBusy, setBusy] = useState(false)

  function signOutOthers() {
    router.post(
      urlFor('staff.sign_out_others'),
      {},
      { preserveScroll: true, onStart: () => setBusy(true), onFinish: () => setBusy(false) }
    )
  }

  const rows = [
    ['Nomor WhatsApp', user.phone, true],
    ['Bergabung', formatDate(user.joinedOn, 'full'), false],
  ] as const

  return (
    <StaffLayout active="lainnya">
      <Head title="Profil & Pengaturan" />
      <StaffTopBar
        title="Profil & Pengaturan"
        back={{ href: urlFor('staff.more'), label: 'Kembali' }}
      />
      <div className="mx-auto flex w-full max-w-190 flex-col gap-3.5 p-4">
        <div className="grid grid-cols-1 items-start gap-3.5 sm:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-3.5">
            <Card>
              <CardContent>
                <div className="flex items-center gap-3.5">
                  <InitialsAvatar initials={initialsOf(user.name)} size="lg" />
                  <div className="min-w-0 flex-1">
                    <CardTitle as="h2">{user.name}</CardTitle>
                    <CardDescription>{user.roleLabel}</CardDescription>
                  </div>
                </div>
                <dl className="divide-y divide-border border-t border-border">
                  {rows.map(([label, value, isMono]) => (
                    <div key={label} className="flex justify-between gap-3 py-3 last:pb-0">
                      <dt className="text-muted-foreground">{label}</dt>
                      <dd className={cn('text-right', isMono && 'font-mono')}>{value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="flex items-start gap-2 text-caption text-muted-foreground">
                  <IconLock className="size-4 shrink-0" />
                  Nama dan peran diatur owner di Pengaturan.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle as="h2">Navigasi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-note text-foreground-secondary">
                  Aplikasi yang dibuka dari tombol “Buka di Google Maps” saat rute bawaan tidak
                  tersedia.
                </p>
                <ChoicePills
                  label="Aplikasi peta"
                  options={MAP_APPS.map((app) => ({ value: app, label: app }))}
                  value={prefs.mapApp}
                  onChange={(app) => preferences.set((current) => ({ ...current, mapApp: app }))}
                />
              </CardContent>
            </Card>
          </div>
          <div className="flex min-w-0 flex-col gap-3.5">
            <PasswordForm action={urlFor('staff.password.update')} />
            <Card>
              <CardHeader>
                <CardTitle as="h2">Perangkat & sesi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2.5">
                  <IconDeviceMobile className="size-5.5 text-foreground-secondary" />
                  <span className="flex-1">
                    <span className="block text-sm font-semibold">Perangkat ini</span>
                    <span className="block text-caption text-muted-foreground">
                      {deviceCount > 1
                        ? `Aktif sekarang · ${deviceCount} perangkat masuk`
                        : 'Aktif sekarang'}
                    </span>
                  </span>
                  <ToneBadge tone="ok">Aktif</ToneBadge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="desktop"
                    onPress={signOutOthers}
                    isPending={isBusy}
                  >
                    <IconDevices className="size-4.5" />
                    Keluar dari perangkat lain
                  </Button>
                  <Button variant="destructive-outline" size="desktop" onPress={signOut}>
                    <IconLogout className="size-4.5" />
                    Keluar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StaffLayout>
  )
}
