import type { ReactNode } from 'react'
import { Head, usePage } from '@inertiajs/react'
import { Form, Link } from '@adonisjs/inertia/react'
import { IconArrowLeft } from '@tabler/icons-react'
import CsrfField from '~/components/atoms/csrf_field'
import PhoneInput from '~/components/molecules/phone_input'
import CustomerLayout from '~/components/templates/customer_layout'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { formatPhone } from '~/lib/phone'

export default function ProfilePhone() {
  const user = usePage().props.user

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-5 pt-4 sm:pt-10">
      <Head title="Ganti Nomor WhatsApp" />
      <Link
        route="customer.profile.edit"
        className="inline-flex min-h-11 items-center gap-2 self-start text-sm font-medium text-foreground/80 hover:text-foreground"
      >
        <IconArrowLeft className="size-4.5" />
        Ubah profil
      </Link>
      <h1 className="text-3xl font-bold tracking-tight">Ganti nomor WhatsApp</h1>

      <Card>
        <Form route="customer.phone.store">
          {({ errors, processing }) => (
            <CardContent className="gap-5">
              <CsrfField />
              <p className="text-base text-muted-foreground">
                Nomor saat ini{' '}
                <span className="font-semibold text-foreground">
                  {formatPhone(user?.phone ?? '')}
                </span>
                . Kami kirim kode verifikasi via WhatsApp ke nomor baru.
              </p>
              <PhoneInput
                id="phone"
                label="Nomor WhatsApp baru"
                description="Nomor lama tetap dipakai sampai kode terverifikasi."
                error={errors.phone}
                required
              />
              <Button
                type="submit"
                isDisabled={processing}
                className="h-11 text-base sm:self-start"
              >
                {processing ? 'Mengirim kode…' : 'Kirim Kode'}
              </Button>
            </CardContent>
          )}
        </Form>
      </Card>
    </div>
  )
}

ProfilePhone.layout = (page: ReactNode) => <CustomerLayout active="profil">{page}</CustomerLayout>
