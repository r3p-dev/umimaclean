import type { ReactNode } from 'react'
import { Form } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'
import CsrfField from '~/components/atoms/csrf_field'
import PasswordInput from '~/components/molecules/password_input'
import { Button } from '~/components/ui/button'
import LogoutButton from '~/components/molecules/logout_button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { formatPhone } from '~/lib/phone'

export function AccountIdentityCard({ children }: { children?: ReactNode }) {
  const user = usePage().props.user

  return (
    <Card>
      <CardContent className="flex-row flex-wrap items-start gap-4 sm:flex-nowrap">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-accent text-lg font-semibold text-accent-foreground">
          {user?.initials}
        </span>
        <span className="flex min-w-0 flex-1 basis-48 flex-col gap-1 self-center sm:basis-0">
          {/* A long name wraps instead of being cut or running under "Ubah". */}
          <span data-slot="account-name" className="text-xl leading-snug font-bold wrap-break-word">
            {user?.fullName}
          </span>
          <span className="text-sm text-muted-foreground">{formatPhone(user?.phone ?? '')}</span>
        </span>
        {/* On phones "Ubah" goes under the name, aligned with it, so the name has the width. */}
        {children && <div className="ml-18 sm:ml-0">{children}</div>}
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

// The last card of every Profil page: signing out, in the same place for every role (D107).
export function AccountCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Akun</CardTitle>
        <CardDescription>Keluar dari akun ini di perangkat ini.</CardDescription>
      </CardHeader>
      <CardContent>
        <LogoutButton />
      </CardContent>
    </Card>
  )
}
