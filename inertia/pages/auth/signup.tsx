import { Head } from '@inertiajs/react'
import { Form, Link } from '@adonisjs/inertia/react'
import { IconArrowLeft } from '@tabler/icons-react'
import FormField from '~/components/molecules/form_field'
import AuthLayout from '~/components/templates/auth_layout'
import { Button } from '~/components/ui/button'

export default function Signup() {
  return (
    <>
      <Head title="Daftar" />
      <h1 className="text-3xl font-bold tracking-tight">Buat akun</h1>
      <p className="mt-1 text-base text-muted-foreground">
        Simpan alamat dan riwayat pesanan, lalu pesan penjemputan kapan saja.
      </p>

      <Form route="register.store" className="mt-8 flex flex-col gap-5">
        {({ errors, processing }) => (
          <>
            <FormField id="fullName" label="Nama" autoComplete="name" error={errors.fullName} />
            <FormField
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              error={errors.email}
            />
            <FormField
              id="password"
              label="Kata sandi"
              type="password"
              autoComplete="new-password"
              description="Minimal 8 karakter."
              error={errors.password}
            />
            <FormField
              id="passwordConfirmation"
              label="Ulangi kata sandi"
              type="password"
              autoComplete="new-password"
              error={errors.passwordConfirmation}
            />
            <Button type="submit" isDisabled={processing} className="mt-3 h-14 text-base">
              {processing ? 'Memproses…' : 'Daftar'}
            </Button>
          </>
        )}
      </Form>

      <p className="mt-6 text-center text-base text-muted-foreground">
        Sudah punya akun?{' '}
        <Link route="session.create" className="font-semibold text-primary hover:underline">
          Masuk
        </Link>
      </p>
      <Link
        route="home"
        className="mt-8 inline-flex min-h-11 items-center gap-2 self-start text-sm text-foreground/80 hover:text-foreground"
      >
        <IconArrowLeft className="size-4.5" />
        Kembali ke beranda
      </Link>
    </>
  )
}

Signup.layout = [AuthLayout]
