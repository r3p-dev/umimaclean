import { Head } from '@inertiajs/react'
import { Form, Link } from '@adonisjs/inertia/react'
import { IconArrowLeft } from '@tabler/icons-react'
import FormField from '~/components/molecules/form_field'
import AuthLayout from '~/components/templates/auth_layout'
import { Button } from '~/components/ui/button'

export default function Login() {
  return (
    <>
      <Head title="Masuk" />
      <h1 className="text-3xl font-bold tracking-tight">Masuk ke Umima Clean</h1>
      <p className="mt-1 text-base text-muted-foreground">
        Pakai email dan kata sandi yang Anda buat saat daftar.
      </p>

      <Form route="session.store" className="mt-8 flex flex-col gap-5">
        {({ errors, processing }) => (
          <>
            <FormField
              id="email"
              label="Email"
              type="email"
              autoComplete="username"
              error={errors.email}
            />
            <FormField
              id="password"
              label="Kata sandi"
              type="password"
              autoComplete="current-password"
              error={errors.password}
            />
            <Button type="submit" isDisabled={processing} className="mt-3 h-14 text-base">
              {processing ? 'Memproses…' : 'Masuk'}
            </Button>
          </>
        )}
      </Form>

      <p className="mt-6 text-center text-base text-muted-foreground">
        Belum punya akun?{' '}
        <Link route="register.create" className="font-semibold text-primary hover:underline">
          Daftar
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

Login.layout = [AuthLayout]
