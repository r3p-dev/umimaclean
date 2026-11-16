import { Form, Link } from '@adonisjs/inertia/react'
import { IconArrowLeft } from '@tabler/icons-react'
import CsrfField from '~/components/atoms/csrf_field'
import FormField from '~/components/molecules/form_field'
import PasswordInput from '~/components/molecules/password_input'
import PhoneInput from '~/components/molecules/phone_input'
import SeoHead from '~/components/molecules/seo_head'
import TurnstileWidget from '~/components/molecules/turnstile_widget'
import AuthLayout from '~/components/templates/auth_layout'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { useTurnstile } from '~/lib/shared/turnstile'

export default function Register() {
  const turnstile = useTurnstile()

  return (
    <>
      <SeoHead
        title="Daftar Akun"
        description="Daftar akun Umima Clean untuk kemudahan memesan penjemputan cucian sepatu, tas, dan helm di Bandung Raya."
      />
      <h1 className="text-3xl font-bold tracking-tight">Buat Akun Umima Clean</h1>
      <p className="mt-1 text-base text-muted-foreground">
        Sekali daftar, pesan berikutnya tinggal pilih barang dan jadwal penjemputan.
      </p>

      <Form route="register.store" className="mt-8 flex flex-col gap-5">
        {({ errors, processing }) => (
          <>
            <CsrfField />
            <input type="hidden" name="turnstile" value={turnstile.token ?? ''} />

            <FormField
              id="name"
              label="Nama lengkap"
              autoComplete="name"
              error={errors.name}
              required
            />

            <PhoneInput
              id="phone"
              name="phone"
              label="Nomor WhatsApp"
              autoComplete="tel"
              error={errors.phone}
              description="Kode verifikasi dikirim ke nomor ini via WhatsApp."
              required
            />

            <PasswordInput
              id="password"
              name="password"
              label="Kata sandi"
              autoComplete="new-password"
              error={errors.password}
              description="Minimal 8 karakter."
              required
            />

            <PasswordInput
              id="passwordConfirmation"
              name="passwordConfirmation"
              label="Ulangi kata sandi"
              autoComplete="new-password"
              error={errors.passwordConfirmation}
              required
            />

            <div className="flex flex-col gap-1.5">
              <Checkbox id="terms" name="terms" value="true">
                <span>
                  Saya setuju dengan{' '}
                  <Link route="legal.terms" className="font-semibold text-primary hover:underline">
                    Syarat Layanan
                  </Link>{' '}
                  dan{' '}
                  <Link
                    route="legal.privacy"
                    className="font-semibold text-primary hover:underline"
                  >
                    Kebijakan Privasi
                  </Link>
                  .
                </span>
              </Checkbox>
              {errors.terms && <p className="text-sm text-destructive">{errors.terms}</p>}
            </div>

            {turnstile.isEnabled && (
              <div className="flex flex-col gap-1.5">
                <TurnstileWidget
                  container={turnstile.container}
                  token={turnstile.token}
                  isEnabled={turnstile.isEnabled}
                />
                {errors.turnstile && <p className="text-sm text-destructive">{errors.turnstile}</p>}
              </div>
            )}

            <Button type="submit" isDisabled={processing} className="mt-2 h-14 text-base">
              {processing ? 'Mengirim kode…' : 'Daftar'}
            </Button>
          </>
        )}
      </Form>

      <div className="mt-6 flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
        <p>
          Sudah punya akun?{' '}
          <Link route="session.create" className="font-semibold text-primary hover:underline">
            Masuk
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

Register.layout = [AuthLayout]
