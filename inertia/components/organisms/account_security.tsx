import type { ReactNode } from 'react'
import { Form } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'
import { IconDevices } from '@tabler/icons-react'
import CsrfField from '~/components/atoms/csrf_field'
import PasswordInput from '~/components/molecules/password_input'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { formatPhone } from '~/lib/phone'

export function AccountIdentityCard({ children }: { children?: ReactNode }) {
  const user = usePage().props.user

  return (
    <Card>
      <CardContent className="flex-row items-center gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-accent text-lg font-semibold text-accent-foreground">
          {user?.initials}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="truncate text-xl font-bold">{user?.fullName}</span>
          <span className="text-sm text-muted-foreground">{formatPhone(user?.phone ?? '')}</span>
        </span>
        {children}
      </CardContent>
    </Card>
  )
}

export function PasswordForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>Ubah kata sandi</h2>
        </CardTitle>
        <CardDescription className="text-base">
          Setelah diganti, perangkat lain harus masuk lagi.
        </CardDescription>
      </CardHeader>
      <Form
        route="account_security.update_password"
        options={{ preserveScroll: true }}
        resetOnSuccess
        className="flex flex-col gap-5"
      >
        {({ errors, processing }) => (
          <CardContent className="gap-5">
            <CsrfField />
            <PasswordInput
              id="currentPassword"
              label="Kata sandi saat ini"
              autoComplete="current-password"
              error={errors.currentPassword}
              required
            />
            <PasswordInput
              id="password"
              label="Kata sandi baru"
              autoComplete="new-password"
              description="Minimal 8 karakter."
              error={errors.password}
              required
            />
            <PasswordInput
              id="passwordConfirmation"
              label="Ulangi kata sandi baru"
              autoComplete="new-password"
              error={errors.passwordConfirmation}
              required
            />
            <Button type="submit" isDisabled={processing} className="h-11 text-base sm:self-start">
              {processing ? 'Menyimpan…' : 'Ubah Kata Sandi'}
            </Button>
          </CardContent>
        )}
      </Form>
    </Card>
  )
}

export function ActiveDevicesCard({
  deviceCount,
  children,
}: {
  deviceCount: number
  children?: ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>Perangkat yang masuk</h2>
        </CardTitle>
        <CardDescription className="text-base">
          Akun ini masuk di {deviceCount} perangkat, termasuk perangkat ini.
        </CardDescription>
      </CardHeader>
      <CardContent className="sm:flex-row sm:flex-wrap">
        <Form route="account_security.sign_out_other_devices" options={{ preserveScroll: true }}>
          {({ processing }) => (
            <>
              <CsrfField />
              <Button
                type="submit"
                variant="outline"
                isDisabled={processing}
                className="h-11 w-full gap-2 text-base"
              >
                <IconDevices className="size-5" />
                Keluar dari perangkat lain
              </Button>
            </>
          )}
        </Form>
        {children}
      </CardContent>
    </Card>
  )
}
