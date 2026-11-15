import { Form, Link } from '@adonisjs/inertia/react'
import CsrfField from '~/components/atoms/csrf_field'
import { IconArrowLeft } from '@tabler/icons-react'
import FormField from '~/components/molecules/form_field'
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
            <FormField
              id="phone"
              label="Nomor WhatsApp"
              type="tel"
              autoComplete="tel"
              description="Contoh: 081234567890"
              error={errors.phone}
            />
            <FormField
              id="password"
              label="Kata sandi"
              type="password"
              autoComplete="current-password"
              error={errors.password}
            />
            <div className="flex items-center gap-2">
              <Checkbox id="rememberMe" name="rememberMe" value="true">
                <span className="text-sm font-normal text-muted-foreground cursor-pointer select-none">
                  Ingat saya selama 180 hari
                </span>
              </Checkbox>
            </div>
            <Button type="submit" isDisabled={processing} className="mt-2 h-14 text-base">
              {processing ? 'Memproses…' : 'Masuk'}
            </Button>
          </>
        )}
      </Form>

      <div className="mt-6 flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
        <p>
          Belum punya akun?{' '}
          <span className="font-semibold text-primary">Daftar (tersedia di M2b)</span>
        </p>
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
