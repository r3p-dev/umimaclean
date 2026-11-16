import type { ReactNode } from 'react'
import { Head, usePage } from '@inertiajs/react'
import { Form, Link } from '@adonisjs/inertia/react'
import { IconArrowLeft } from '@tabler/icons-react'
import CsrfField from '~/components/atoms/csrf_field'
import { PasswordForm } from '~/components/organisms/account_security'
import CustomerLayout from '~/components/templates/customer_layout'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Field, FieldError, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { formatPhone } from '~/lib/phone'

export default function ProfileEdit() {
  const user = usePage().props.user

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-5 pt-4 sm:pt-10">
      <Head title="Ubah Profil" />
      <Link
        route="customer.profile.show"
        className="inline-flex min-h-11 items-center gap-2 self-start text-sm font-medium text-foreground/80 hover:text-foreground"
      >
        <IconArrowLeft className="size-4.5" />
        Profil
      </Link>
      <h1 className="text-3xl font-bold tracking-tight">Ubah profil</h1>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Data diri</h2>
          </CardTitle>
        </CardHeader>
        <Form route="customer.profile.update" options={{ preserveScroll: true }}>
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
                  route="customer.phone.edit"
                  aria-label="Ganti nomor WhatsApp"
                  className="inline-flex min-h-11 items-center px-3 text-base font-semibold text-primary hover:underline"
                >
                  Ganti
                </Link>
              </div>
              <Button
                type="submit"
                isDisabled={processing}
                className="h-11 text-base sm:self-start"
              >
                {processing ? 'Menyimpan…' : 'Simpan Data Diri'}
              </Button>
            </CardContent>
          )}
        </Form>
      </Card>

      <PasswordForm />
    </div>
  )
}

ProfileEdit.layout = (page: ReactNode) => <CustomerLayout active="profil">{page}</CustomerLayout>
