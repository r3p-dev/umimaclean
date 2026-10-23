import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { router } from '@inertiajs/react'
import PhoneInput from '~/components/molecules/phone_input'
import PasswordInput from '~/components/molecules/password_input'
import TurnstileWidget from '~/components/molecules/turnstile_widget'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Field, FieldError, FieldLabel } from '~/components/ui/field'
import { useTurnstile } from '~/lib/shared/turnstile'
import { phoneError } from '~/lib/shared/validation'

type Errors = Partial<Record<'phone' | 'password' | 'turnstile', string>>

export default function SignInForm({
  action,
  title,
  description,
  forgot,
  footer,
}: {
  action: string
  title: string
  description: string
  forgot?: ReactNode
  footer?: ReactNode
}) {
  const turnstile = useTurnstile()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [shouldRemember, setRemember] = useState(true)
  const [errors, setErrors] = useState<Errors>({})
  const [isBusy, setBusy] = useState(false)
  const phoneRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  function focusFirst(found: Errors) {
    if (found.phone) {
      phoneRef.current?.focus()
    } else if (found.password) {
      passwordRef.current?.focus()
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    if (isBusy) {
      return
    }
    const found: Errors = {}
    const phoneProblem = phoneError(phone)
    if (phoneProblem) {
      found.phone = phoneProblem
    }
    if (!password) {
      found.password = 'Kata sandi wajib diisi.'
    }
    if (turnstile.isEnabled && !turnstile.token) {
      found.turnstile = 'Selesaikan verifikasi keamanan, lalu coba lagi.'
    }
    setErrors(found)
    if (Object.keys(found).length) {
      return focusFirst(found)
    }

    router.post(
      action,
      { phone, password, remember: shouldRemember, turnstile: turnstile.token },
      {
        preserveScroll: true,
        onStart: () => setBusy(true),
        onError: (serverErrors) => {
          setErrors(serverErrors)
          setPassword('')
          focusFirst(serverErrors.phone ? serverErrors : { password: serverErrors.password })
        },
        onFinish: () => {
          setBusy(false)
          turnstile.reset()
        },
      }
    )
  }

  return (
    <form onSubmit={submit} noValidate aria-busy={isBusy} className="flex flex-col">
      <h1 className="text-[28px] leading-[1.15] font-bold tracking-[-0.02em]">{title}</h1>
      <p className="mt-2 text-[15px] leading-normal text-foreground-secondary">{description}</p>
      <Field className="mt-6">
        <FieldLabel htmlFor="sign-in-phone">Nomor WhatsApp</FieldLabel>
        <PhoneInput
          ref={phoneRef}
          id="sign-in-phone"
          value={phone}
          onChange={(value) => {
            setPhone(value)
            if (errors.phone) {
              setErrors({ ...errors, phone: undefined })
            }
          }}
          isInvalid={!!errors.phone}
          describedBy={errors.phone ? 'sign-in-phone-error' : undefined}
        />
        {errors.phone && <FieldError id="sign-in-phone-error">{errors.phone}</FieldError>}
      </Field>
      <Field className="mt-4.5">
        <FieldLabel htmlFor="sign-in-password">Kata sandi</FieldLabel>
        <PasswordInput
          ref={passwordRef}
          id="sign-in-password"
          autoComplete="current-password"
          value={password}
          onChange={(value) => {
            setPassword(value)
            if (errors.password) {
              setErrors({ ...errors, password: undefined })
            }
          }}
          isInvalid={!!errors.password}
          describedBy={errors.password ? 'sign-in-password-error' : undefined}
        />
        {errors.password && <FieldError id="sign-in-password-error">{errors.password}</FieldError>}
      </Field>
      <div className="mt-3 flex items-center justify-between gap-3">
        <Checkbox
          isSelected={shouldRemember}
          onChange={setRemember}
          buttonClassName="size-auto min-h-icon-btn justify-start gap-2.5 text-sm leading-[1.4] font-medium"
        >
          Ingat saya
        </Checkbox>
        {forgot}
      </div>
      {turnstile.isEnabled && (
        <div className="mt-3">
          <TurnstileWidget container={turnstile.container} isEnabled={turnstile.isEnabled} />
          {errors.turnstile && <FieldError className="mt-2">{errors.turnstile}</FieldError>}
        </div>
      )}
      <Button type="submit" size="cta" className="mt-5 w-full" isPending={isBusy}>
        {isBusy ? 'Memeriksa…' : 'Masuk'}
      </Button>
      {footer}
    </form>
  )
}
