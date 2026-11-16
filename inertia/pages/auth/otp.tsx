import { useState } from 'react'
import { Form, Link } from '@adonisjs/inertia/react'
import { router, usePage } from '@inertiajs/react'
import { IconArrowLeft, IconDeviceMobile } from '@tabler/icons-react'
import CsrfField from '~/components/atoms/csrf_field'
import OtpInput from '~/components/molecules/otp_input'
import SeoHead from '~/components/molecules/seo_head'
import TurnstileWidget from '~/components/molecules/turnstile_widget'
import AuthLayout from '~/components/templates/auth_layout'
import { Button } from '~/components/ui/button'
import { useResendTimer } from '~/lib/shared/countdown'
import { useTurnstile } from '~/lib/shared/turnstile'

export default function OtpPage({
  purpose,
  maskedPhone,
  resendIn,
  ttlMinutes,
  isLocked,
}: {
  purpose: 'register' | 'reset_password' | 'change_phone'
  maskedPhone: string
  resendIn: number
  ttlMinutes: number
  isLocked: boolean
}) {
  const turnstile = useTurnstile()
  const page = usePage<{
    flash?: { success?: string; error?: string }
    errors?: Record<string, string>
  }>()
  const { remaining } = useResendTimer(resendIn)
  const [code, setCode] = useState('')
  const [isResending, setIsResending] = useState(false)

  const serverError =
    page.props.errors?.code || (isLocked ? 'Kode salah 5 kali. Minta kode baru.' : undefined)

  const title =
    purpose === 'register'
      ? 'Verifikasi Nomor WhatsApp'
      : purpose === 'reset_password'
        ? 'Masukkan Kode Verifikasi'
        : 'Verifikasi Nomor Baru'

  const submitLabel =
    purpose === 'register'
      ? 'Verifikasi & Buat Akun'
      : purpose === 'reset_password'
        ? 'Verifikasi'
        : 'Verifikasi & Ganti Nomor'

  const restartRoute =
    purpose === 'register'
      ? 'register.create'
      : purpose === 'reset_password'
        ? 'password_reset.create'
        : 'customer.phone.edit'

  function handleResend() {
    if (remaining > 0 || isResending) {
      return
    }

    setIsResending(true)
    router.post(
      '/verifikasi/kirim-ulang',
      { turnstile: turnstile.token },
      {
        preserveScroll: true,
        onFinish: () => {
          setIsResending(false)
          turnstile.reset()
        },
      }
    )
  }

  return (
    <>
      <SeoHead
        title="Verifikasi WhatsApp"
        description="Verifikasi kode OTP 6 digit yang dikirim via WhatsApp untuk melanjutkan."
      />
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="mt-1 text-base text-muted-foreground">
        Masukkan 6 digit kode yang kami kirim via WhatsApp ke{' '}
        <strong className="font-semibold text-foreground">{maskedPhone}</strong>. Kode berlaku{' '}
        {ttlMinutes} menit.
      </p>

      <div className="mt-4 flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
        <IconDeviceMobile className="size-5 shrink-0 text-primary" />
        <span>Kode masuk ke WhatsApp di ponsel Anda dari nomor resmi Umima Clean.</span>
      </div>

      <Form route="otp.verify" className="mt-6 flex flex-col gap-5">
        {({ processing }) => (
          <>
            <CsrfField />
            <input type="hidden" name="code" value={code} />

            <div className="flex flex-col gap-2">
              <OtpInput
                value={code}
                onChange={setCode}
                length={6}
                isInvalid={Boolean(serverError)}
                isDisabled={isLocked || processing}
                describedBy={serverError ? 'otp-error' : undefined}
              />
              {serverError && (
                <p id="otp-error" className="text-sm font-medium text-destructive">
                  {serverError}
                </p>
              )}
            </div>

            <div className="flex min-h-11 items-center justify-between gap-3 text-sm text-muted-foreground">
              {remaining > 0 ? (
                <span role="status">
                  Kirim ulang dalam{' '}
                  <span className="font-mono font-medium text-foreground">{remaining}s</span>
                </span>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  className="h-auto p-0 font-semibold text-primary hover:bg-transparent hover:underline"
                  onPress={handleResend}
                  isDisabled={isResending}
                >
                  {isResending ? 'Mengirim ulang…' : 'Kirim ulang kode'}
                </Button>
              )}

              <Link route={restartRoute} className="font-semibold text-primary hover:underline">
                Ganti nomor
              </Link>
            </div>

            {turnstile.isEnabled && (
              <div className="flex flex-col gap-1.5">
                <TurnstileWidget
                  container={turnstile.container}
                  token={turnstile.token}
                  isEnabled={turnstile.isEnabled}
                />
                {page.props.errors?.turnstile && (
                  <p className="text-sm text-destructive">{page.props.errors.turnstile}</p>
                )}
              </div>
            )}

            <Button
              type="submit"
              isDisabled={code.length < 6 || isLocked || processing}
              className="mt-2 h-14 text-base"
            >
              {processing ? 'Memverifikasi…' : submitLabel}
            </Button>
          </>
        )}
      </Form>

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

OtpPage.layout = [AuthLayout]
