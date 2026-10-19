import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Head, router } from '@inertiajs/react'
import { urlFor } from '~/client'
import { Button } from '~/components/ui/button'
import FlowHeader from '~/components/organisms/flow_header'
import OtpDialog from '~/components/organisms/verification/otp_dialog'
import PhoneSignInCard from '~/components/organisms/verification/phone_sign_in_card'
import FlowLayout from '~/components/templates/flow_layout'
import { phoneError } from '~/lib/shared/phone'
import { sendCode, verifiedPhone } from '~/lib/verification/session'

export default function TrackingSignIn() {
  const [alreadyVerified] = useState(() => !!verifiedPhone())
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (alreadyVerified) router.visit(urlFor('tracking.orders'), { replace: true })
  }, [alreadyVerified])

  async function submit(event: FormEvent) {
    event.preventDefault()
    const problem = phoneError(phone)
    setError(problem)
    if (problem) {
      inputRef.current?.focus()
      return
    }
    setBusy(true)
    await sendCode(phone)
    setBusy(false)
    setVerifying(true)
  }

  function changeNumber() {
    setVerifying(false)
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }

  if (alreadyVerified) return null

  return (
    <div className="min-h-screen bg-background">
      <Head title="Lacak Pesanan" />
      <FlowHeader title="Lacak Pesanan" className="bg-card" />
      <PhoneSignInCard
        inputRef={inputRef}
        phone={phone}
        error={error}
        busy={busy}
        onPhoneChange={(value) => {
          setPhone(value)
          if (error) setError(phoneError(value))
        }}
        onSubmit={submit}
      />
      <OtpDialog
        open={verifying}
        onOpenChange={setVerifying}
        phone={phone}
        submitLabel="Verifikasi"
        onVerified={() => router.visit(urlFor('tracking.orders'), { replace: true })}
        changeNumber={
          <Button type="button" variant="link" onPress={changeNumber}>
            Ganti nomor
          </Button>
        }
      />
    </div>
  )
}

TrackingSignIn.layout = [FlowLayout]
