import { Form, Link } from '@adonisjs/inertia/react'
import CsrfField from '~/components/atoms/csrf_field'
import { IconArrowLeft } from '@tabler/icons-react'
import PasswordInput from '~/components/molecules/password_input'
import PhoneInput from '~/components/molecules/phone_input'
import SeoHead from '~/components/molecules/seo_head'
import AuthLayout from '~/components/templates/auth_layout'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'

export default function Login() {
  return (
    <>
      <SeoHead
        title="Masuk Pelanggan"
        description="Masuk ke akun Umima Clean untuk memesan penjemputan dan memantau status pesanan sepatu, tas, dan helm Anda."
      />
      <h1 className="text-3xl font-bold tracking-tight">Masuk ke Umima Clean</h1>
      <p className="mt-1 text-base text-muted-foreground">
        Masuk menggunakan nomor WhatsApp dan kata sandi Anda.
      </p>

      <Form route="session.store" className="mt-8 flex flex-col gap-5">
        {({ errors, processing }) => (
          <>
            <CsrfField />
            <PhoneInput
              id="phone"
              name="phone"
              label="Nomor WhatsApp"
              autoComplete="tel"
              error={errors.phone}
              required
            />
            <PasswordInput
              id="password"
              name="password"
              label="Kata sandi"
              autoComplete="current-password"
              error={errors.password}
              required
            />
            <Checkbox id="rememberMe" name="rememberMe" value="true">
              Ingat saya
            </Checkbox>
            <Button type="submit" isDisabled={processing} className="mt-2 h-14 text-base">
              {processing ? 'Memproses…' : 'Masuk'}
            </Button>
          </>
        )}
      </Form>

      <div className="mt-6 flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
        <p>
          Staf operasional atau pemilik?{' '}
          <Link href="/staf/masuk" className="font-semibold text-primary hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>

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
