import { Form, Link } from '@adonisjs/inertia/react'
import CsrfField from '~/components/atoms/csrf_field'
import { IconArrowLeft } from '@tabler/icons-react'
import PasswordInput from '~/components/molecules/password_input'
import PhoneInput from '~/components/molecules/phone_input'
import SeoHead from '~/components/molecules/seo_head'
import AuthLayout from '~/components/templates/auth_layout'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'

export default function StaffLogin() {
  return (
    <>
      <SeoHead
        title="Masuk Staf & Pemilik"
        description="Pintu masuk khusus staf operasional dan pemilik usaha Umima Clean Bandung Raya."
      />
      <h1 className="text-3xl font-bold tracking-tight">Masuk Staf & Pemilik</h1>
      <p className="mt-1 text-base text-muted-foreground">
        Khusus tim operasional dan pemilik Umima Clean.
      </p>

      <Form route="session.storeStaff" className="mt-8 flex flex-col gap-5">
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

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Bukan staf atau pemilik?{' '}
        <Link href="/masuk" className="font-semibold text-primary hover:underline">
          Masuk sebagai pelanggan
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

StaffLogin.layout = [AuthLayout]
