import { useState, type FormEvent } from 'react'
import { Head, router } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { IconDeviceMobile } from '@tabler/icons-react'
import type { OtpPurpose } from '@enums/otp_enum'
import { urlFor } from '~/client'
import InfoNote from '~/components/molecules/info_note'
import OtpInput from '~/components/molecules/otp_input'
import TurnstileWidget from '~/components/molecules/turnstile_widget'
import AuthLayout from '~/components/templates/auth_layout'
import { Button } from '~/components/ui/button'
import { FieldError } from '~/components/ui/field'
import { useResendTimer } from '~/lib/shared/countdown'
import { formatDuration } from '~/lib/shared/format'
import { useTurnstile } from '~/lib/shared/turnstile'
import { OTP_LENGTH, OTP_SCREEN } from '~/lib/verification/otp'

function ResendControl({
  seconds,
  isResending,
  onResend,
}: {
  seconds: number
  isResending: boolean
  onResend: () => void
}) {
  const { remaining } = useResendTimer(seconds)
  if (remaining > 0) {
    return (
      <span role="status">
        Kirim ulang dalam{' '}
        <span className="font-mono text-foreground">{formatDuration(remaining)}</span>
      </span>
    )
  }
  return (
    <Button variant="link" onPress={onResend} isPending={isResending}>
      {isResending ? 'Mengirim…' : 'Kirim ulang kode'}
    </Button>
  )
}

export default function VerifyCode({
  purpose,
  maskedPhone,
  resendIn,
  ttlMinutes,
  isLocked,
}: {
  purpose: OtpPurpose
  maskedPhone: string
  resendIn: number
  ttlMinutes: number
  isLocked: boolean
}) {
  const screen = OTP_SCREEN[purpose]
  const turnstile = useTurnstile()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(
    isLocked ? 'Kode salah 5 kali. Minta kode baru.' : null
  )
  const [resends, setResends] = useState(0)
  const [isBusy, setBusy] = useState(false)
  const [isResending, setResending] = useState(false)
  const isDisabled = isLocked || isBusy

  function verify(value = code) {
    if (value.length < OTP_LENGTH || isDisabled) {
      return
    }
    router.post(
      urlFor('auth.otp.verify'),
      { code: value },
      {
        preserveScroll: true,
        onStart: () => setBusy(true),
        onError: (errors) => {
          setError(errors.code ?? 'Kode salah atau sudah kedaluwarsa.')
          setCode('')
        },
        onFinish: () => setBusy(false),
      }
    )
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    verify()
  }

  function resend() {
    if (turnstile.isEnabled && !turnstile.token) {
      setError('Selesaikan verifikasi keamanan, lalu kirim ulang.')
      return
    }
    router.post(
      urlFor('auth.otp.resend'),
      { turnstile: turnstile.token },
      {
        preserveScroll: true,
        onStart: () => setResending(true),
        onSuccess: () => {
          setError(null)
          setCode('')
          setResends((count) => count + 1)
        },
        onError: (errors) => setError(errors.code ?? errors.turnstile ?? null),
        onFinish: () => {
          setResending(false)
          turnstile.reset()
        },
      }
    )
  }

  return (
    <>
      <Head title="Verifikasi Kode" />
      <form onSubmit={submit} noValidate aria-busy={isBusy} className="flex flex-col">
        <h1 className="text-[28px] leading-[1.15] font-bold tracking-[-0.02em]">{screen.title}</h1>
        <p className="mt-2 text-[15px] leading-normal text-foreground-secondary">
          Masukkan 6 digit kode yang kami kirim via WhatsApp ke{' '}
          <strong className="font-semibold whitespace-nowrap text-foreground">{maskedPhone}</strong>
          . Kode berlaku {ttlMinutes} menit.
        </p>
        <InfoNote icon={IconDeviceMobile} tone="accent" className="mt-4 max-lg:hidden">
          Kode masuk ke WhatsApp di ponsel Anda, dari nomor Umima Clean.
        </InfoNote>
        <div className="mt-6 flex flex-col gap-2">
          <OtpInput
            value={code}
            onChange={(next) => {
              setCode(next)
              if (error && !isLocked) {
                setError(null)
              }
              if (next.length === OTP_LENGTH) {
                verify(next)
              }
            }}
            length={OTP_LENGTH}
            isInvalid={!!error}
            isDisabled={isDisabled}
            describedBy={error ? 'otp-error' : undefined}
          />
          {error && <FieldError id="otp-error">{error}</FieldError>}
        </div>
        <div className="mt-3 flex min-h-icon-btn items-center justify-between gap-3 text-sm leading-[1.4] text-muted-foreground">
          <ResendControl
            key={resends}
            seconds={resendIn}
            isResending={isResending}
            onResend={resend}
          />
          <Link
            href={urlFor(screen.restart)}
            className="inline-flex min-h-icon-btn items-center font-semibold text-primary hover:text-primary-hover"
          >
            Ganti nomor
          </Link>
        </div>
        {turnstile.isEnabled && (
          <TurnstileWidget
            container={turnstile.container}
            isEnabled={turnstile.isEnabled}
            className="mt-2"
          />
        )}
        <Button
          type="submit"
          size="cta"
          className="mt-5 w-full"
          isDisabled={code.length < OTP_LENGTH || isDisabled}
          isPending={isBusy}
        >
          {isBusy ? 'Memverifikasi…' : screen.submit}
        </Button>
      </form>
    </>
  )
}

VerifyCode.layout = [AuthLayout]
