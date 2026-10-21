import { useRef, useState, type FormEvent } from 'react'
import { Head, router } from '@inertiajs/react'
import { urlFor } from '~/client'
import BackLink from '~/components/molecules/back_link'
import PhoneInput from '~/components/molecules/phone_input'
import TurnstileWidget from '~/components/molecules/turnstile_widget'
import AuthLayout from '~/components/templates/auth_layout'
import { Button } from '~/components/ui/button'
import { Field, FieldDescription, FieldError, FieldLabel } from '~/components/ui/field'
import { useTurnstile } from '~/lib/shared/turnstile'
import { phoneError } from '~/lib/shared/validation'

type Errors = Partial<Record<'phone' | 'turnstile', string>>

export default function ForgotPassword() {
  const turnstile = useTurnstile()
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [isBusy, setBusy] = useState(false)
  const phoneRef = useRef<HTMLInputElement>(null)

  function submit(event: FormEvent) {
    event.preventDefault()
    if (isBusy) {
      return
    }
    const found: Errors = {}
    const problem = phoneError(phone)
    if (problem) {
      found.phone = problem
    }
    if (turnstile.isEnabled && !turnstile.token) {
      found.turnstile = 'Selesaikan verifikasi keamanan, lalu coba lagi.'
    }
    setErrors(found)
    if (found.phone) {
      return phoneRef.current?.focus()
    }
    if (found.turnstile) {
      return
    }

    router.post(
      urlFor('auth.password.forgot.store'),
      { phone, turnstile: turnstile.token },
      {
        preserveScroll: true,
        onStart: () => setBusy(true),
        onError: (serverErrors) => {
          setErrors(serverErrors)
          if (serverErrors.phone) {
            phoneRef.current?.focus()
          }
        },
        onFinish: () => {
          setBusy(false)
          turnstile.reset()
        },
      }
    )
  }

  return (
    <>
      <Head title="Lupa Kata Sandi" />
      <form onSubmit={submit} noValidate aria-busy={isBusy} className="flex flex-col">
        <h1 className="text-[28px] leading-[1.15] font-bold tracking-[-0.02em]">Lupa kata sandi</h1>
        <p className="mt-2 text-[15px] leading-normal text-foreground-secondary">
          Masukkan nomor WhatsApp akun Anda. Kami kirim kode verifikasi untuk membuat kata sandi
          baru.
        </p>
        <Field className="mt-6">
          <FieldLabel htmlFor="forgot-phone">Nomor WhatsApp</FieldLabel>
          <PhoneInput
            ref={phoneRef}
            id="forgot-phone"
            value={phone}
            onChange={(value) => {
              setPhone(value)
              if (errors.phone) {
                setErrors({ ...errors, phone: undefined })
              }
            }}
            isInvalid={!!errors.phone}
            describedBy={errors.phone ? 'forgot-phone-error' : 'forgot-phone-help'}
          />
          {errors.phone ? (
            <FieldError id="forgot-phone-error">{errors.phone}</FieldError>
          ) : (
            <FieldDescription id="forgot-phone-help">
              Jika nomor terdaftar, kode dikirim via WhatsApp.
            </FieldDescription>
          )}
        </Field>
        {turnstile.isEnabled && (
          <div className="mt-4">
            <TurnstileWidget container={turnstile.container} isEnabled={turnstile.isEnabled} />
            {errors.turnstile && <FieldError className="mt-2">{errors.turnstile}</FieldError>}
          </div>
        )}
        <Button type="submit" size="cta" className="mt-5 w-full" isPending={isBusy}>
          {isBusy ? 'Mengirim kode…' : 'Kirim Kode'}
        </Button>
      </form>
      <BackLink href={urlFor('auth.login')} label="Kembali ke halaman masuk" className="mt-2" />
    </>
  )
}

ForgotPassword.layout = [AuthLayout]
