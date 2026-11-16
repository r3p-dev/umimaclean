import { Form, Link } from '@adonisjs/inertia/react'
import { IconArrowLeft } from '@tabler/icons-react'
import CsrfField from '~/components/atoms/csrf_field'
import PhoneInput from '~/components/molecules/phone_input'
import SeoHead from '~/components/molecules/seo_head'
import TurnstileWidget from '~/components/molecules/turnstile_widget'
import AuthLayout from '~/components/templates/auth_layout'
import { Button } from '~/components/ui/button'
import { useTurnstile } from '~/lib/shared/turnstile'

export default function ForgotPassword() {
  const turnstile = useTurnstile()

  return (
    <>
      <SeoHead
        title="Lupa Kata Sandi"
        description="Atur ulang kata sandi akun Umima Clean Anda melalui verifikasi kode WhatsApp."
      />
      <h1 className="text-3xl font-bold tracking-tight">Lupa Kata Sandi</h1>
      <p className="mt-1 text-base text-muted-foreground">
        Masukkan nomor WhatsApp akun Anda. Kami kirim kode verifikasi untuk membuat kata sandi baru.
      </p>

      <Form route="password_reset.store" className="mt-8 flex flex-col gap-5">
        {({ errors, processing }) => (
          <>
            <CsrfField />
            <input type="hidden" name="turnstile" value={turnstile.token ?? ''} />

            <PhoneInput
              id="phone"
              name="phone"
              label="Nomor WhatsApp"
              autoComplete="tel"
              error={errors.phone}
              description="Jika nomor terdaftar, kode dikirim via WhatsApp."
              required
            />

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
              {processing ? 'Mengirim kode…' : 'Kirim Kode'}
            </Button>
          </>
        )}
      </Form>

      <div className="mt-6 flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
        <p>
          Ingat kata sandi Anda?{' '}
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

ForgotPassword.layout = [AuthLayout]
