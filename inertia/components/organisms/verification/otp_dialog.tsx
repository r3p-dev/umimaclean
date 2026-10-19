import { useState, type FormEvent, type ReactNode } from 'react'
import { toast } from 'sonner'
import { IconDevices } from '@tabler/icons-react'
import { Button } from '~/components/ui/button'
import { Dialog, DialogDescription, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { FieldDescription, FieldError } from '~/components/ui/field'
import InfoNote from '~/components/molecules/info_note'
import OtpInput from '~/components/molecules/otp_input'
import { useResendTimer } from '~/lib/shared/countdown'
import { formatDuration } from '~/lib/shared/format'
import { displayPhone } from '~/lib/shared/phone'
import {
  DEMO_OTP,
  OTP_ATTEMPTS,
  OTP_LENGTH,
  RESEND_SECONDS,
  rememberDevice,
  sendCode,
  verifyCode,
} from '~/lib/verification/session'

type OtpDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  phone: string
  submitLabel: string
  changeNumber: ReactNode
  onVerified: () => void
}

function OtpForm({
  phone,
  submitLabel,
  changeNumber,
  onVerified,
}: Omit<OtpDialogProps, 'open' | 'onOpenChange'>) {
  const [code, setCode] = useState('')
  const [attemptsLeft, setAttemptsLeft] = useState(OTP_ATTEMPTS)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const { remaining, restart } = useResendTimer(RESEND_SECONDS)
  const locked = attemptsLeft === 0

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (code.length < OTP_LENGTH || busy || locked) return
    setBusy(true)
    const valid = await verifyCode(phone, code)
    setBusy(false)
    if (valid) {
      rememberDevice(phone)
      onVerified()
      return
    }
    const left = attemptsLeft - 1
    setAttemptsLeft(left)
    setCode('')
    setError(
      left === 0
        ? 'Terlalu banyak percobaan. Kirim ulang kode untuk mencoba lagi.'
        : `Kode salah. Sisa ${left} percobaan.`
    )
  }

  async function resend() {
    await sendCode(phone)
    restart()
    setAttemptsLeft(OTP_ATTEMPTS)
    setError(null)
    setCode('')
    toast.success('Kode baru dikirim via WhatsApp.')
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4.5">
      <DialogHeader>
        <DialogTitle>Verifikasi nomor WhatsApp</DialogTitle>
        <DialogDescription>
          Masukkan 6 digit kode yang kami kirim ke{' '}
          <strong className="font-semibold text-foreground">{displayPhone(phone)}</strong>.
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-2">
        <OtpInput
          value={code}
          onChange={(next) => {
            setCode(next)
            if (error && !locked) setError(null)
          }}
          length={OTP_LENGTH}
          invalid={!!error}
          disabled={locked || busy}
          describedBy={error ? 'otp-error' : undefined}
        />
        {error && <FieldError id="otp-error">{error}</FieldError>}
        {import.meta.env.DEV && (
          <FieldDescription>Mode pengembangan: kode demo {DEMO_OTP}.</FieldDescription>
        )}
      </div>
      <div className="flex items-center justify-between text-sm leading-[1.4] text-muted-foreground">
        {remaining > 0 ? (
          <span>
            Kirim ulang dalam <span className="font-mono">{formatDuration(remaining)}</span>
          </span>
        ) : (
          <Button type="button" variant="link" onPress={resend}>
            Kirim ulang kode
          </Button>
        )}
        {changeNumber}
      </div>
      <InfoNote icon={IconDevices} tone="accent">
        Setelah terverifikasi, perangkat ini bisa membuka lacak &amp; riwayat pesanan tanpa kode
        lagi selama 30 hari.
      </InfoNote>
      <Button
        type="submit"
        size="cta"
        isDisabled={code.length < OTP_LENGTH || busy || locked}
        aria-busy={busy}
      >
        {busy ? 'Memverifikasi…' : submitLabel}
      </Button>
    </form>
  )
}

export default function OtpDialog({ open, onOpenChange, ...props }: OtpDialogProps) {
  return (
    <Dialog isOpen={open} onOpenChange={onOpenChange}>
      {open && <OtpForm {...props} />}
    </Dialog>
  )
}
