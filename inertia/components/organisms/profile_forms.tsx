import { usePage } from '@inertiajs/react'
import { Form, Link } from '@adonisjs/inertia/react'
import { IconArrowLeft } from '@tabler/icons-react'
import CsrfField from '~/components/atoms/csrf_field'
import PasswordInput from '~/components/molecules/password_input'
import PhoneInput from '~/components/molecules/phone_input'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Field, FieldError, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { PROFILE_ROUTES, type ProfileArea } from '~/lib/navigation/profile_links'
import { formatPhone } from '~/lib/phone'

// The Profil forms every role shares (CUST-12, CUST-13, OWN-13, STAFF-16, D108); each page only
// adds its own layout and names its area.
function useProfileRoutes(area: ProfileArea) {
  return { user: usePage().props.user, routes: PROFILE_ROUTES[area] }
}

export function BackLink({ area, to }: { area: ProfileArea; to: 'show' | 'edit' }) {
  const { routes } = useProfileRoutes(area)
  return (
    <Link
      route={routes[to]}
      className="inline-flex min-h-11 items-center gap-2 self-start text-sm font-medium text-foreground/80 hover:text-foreground"
    >
      <IconArrowLeft className="size-4.5" />
      {to === 'show' ? 'Profil' : 'Ubah profil'}
    </Link>
  )
}

export function EditProfileLink({ area }: { area: ProfileArea }) {
  const { routes } = useProfileRoutes(area)
  return (
    <Link
      route={routes.edit}
      className="inline-flex h-11 items-center rounded-md border border-border bg-background px-3 text-base font-medium shadow-xs hover:bg-muted"
    >
      Ubah
    </Link>
  )
}

export function ProfileDetailsCard({ area }: { area: ProfileArea }) {
  const { user, routes } = useProfileRoutes(area)

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>Data diri</h2>
        </CardTitle>
      </CardHeader>
      <Form route={routes.update} options={{ preserveScroll: true }}>
        {({ errors, processing }) => (
          <CardContent className="gap-5">
            <CsrfField />
            <Field data-invalid={errors.name ? true : undefined}>
              <FieldLabel htmlFor="name">Nama</FieldLabel>
              <Input
                id="name"
                name="name"
                autoComplete="name"
                defaultValue={user?.fullName}
                required
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={errors.name ? 'name-error' : undefined}
                className="h-12"
              />
              {errors.name && <FieldError id="name-error">{errors.name}</FieldError>}
            </Field>
            <div className="flex min-h-12 items-center justify-between gap-3 rounded-md bg-muted pl-3">
              <span className="flex flex-col">
                <span className="text-sm text-muted-foreground">Nomor WhatsApp</span>
                <span className="text-base">{formatPhone(user?.phone ?? '')}</span>
              </span>
              <Link
                route={routes.phone}
                aria-label="Ganti nomor WhatsApp"
                className="inline-flex min-h-11 items-center px-3 text-base font-semibold text-primary hover:underline"
              >
                Ganti
              </Link>
            </div>
            <Button type="submit" isDisabled={processing} className="h-11 text-base sm:self-start">
              {processing ? 'Menyimpan…' : 'Simpan Data Diri'}
            </Button>
          </CardContent>
        )}
      </Form>
    </Card>
  )
}

export function PhoneChangeCard({ area }: { area: ProfileArea }) {
  const { user, routes } = useProfileRoutes(area)

  return (
    <Card>
      <Form route={routes.phoneStore}>
        {({ errors, processing }) => (
          <CardContent className="gap-5">
            <CsrfField />
            <p className="text-base text-muted-foreground">
              Nomor saat ini{' '}
              <span className="font-semibold text-foreground">
                {formatPhone(user?.phone ?? '')}
              </span>
              . Nomor ini dipakai untuk masuk, jadi kami minta kata sandi Anda lalu mengirim kode
              verifikasi via WhatsApp ke nomor baru.
            </p>
            <PhoneInput
              id="phone"
              label="Nomor WhatsApp baru"
              description="Nomor lama tetap dipakai sampai kode terverifikasi."
              error={errors.phone}
              required
            />
            <PasswordInput
              id="phone-current-password"
              name="currentPassword"
              label="Kata sandi saat ini"
              autoComplete="current-password"
              error={errors.currentPassword}
              required
            />
            <Button type="submit" isDisabled={processing} className="h-11 text-base sm:self-start">
              {processing ? 'Mengirim kode…' : 'Kirim Kode'}
            </Button>
          </CardContent>
        )}
      </Form>
    </Card>
  )
}
