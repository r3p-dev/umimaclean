import { useRef, useState, type FormEvent } from 'react'
import { Head, router } from '@inertiajs/react'
import { urlFor } from '~/client'
import PasswordInput from '~/components/molecules/password_input'
import AuthLayout from '~/components/templates/auth_layout'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Field, FieldDescription, FieldError, FieldLabel } from '~/components/ui/field'
import { passwordError } from '~/lib/shared/validation'

type Errors = Partial<Record<'password' | 'passwordConfirmation', string>>

export default function ResetPassword({ maskedPhone }: { maskedPhone: string }) {
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [shouldLogoutOthers, setLogoutOthers] = useState(true)
  const [errors, setErrors] = useState<Errors>({})
  const [isBusy, setBusy] = useState(false)
  const passwordRef = useRef<HTMLInputElement>(null)
  const confirmationRef = useRef<HTMLInputElement>(null)

  function focusFirst(found: Errors) {
    if (found.password) {
      passwordRef.current?.focus()
    } else if (found.passwordConfirmation) {
      confirmationRef.current?.focus()
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    if (isBusy) {
      return
    }
    const found: Errors = {}
    const problem = passwordError(password)
    if (problem) {
      found.password = problem
    } else if (confirmation !== password) {
      found.passwordConfirmation = 'Kata sandi tidak sama.'
    }
    setErrors(found)
    if (Object.keys(found).length) {
      return focusFirst(found)
    }

    router.put(
      urlFor('auth.password.reset.update'),
      { password, passwordConfirmation: confirmation, logoutOthers: shouldLogoutOthers },
      {
        onStart: () => setBusy(true),
        onError: (serverErrors) => {
          setErrors(serverErrors)
          focusFirst(serverErrors)
        },
        onFinish: () => setBusy(false),
      }
    )
  }

  return (
    <>
      <Head title="Kata Sandi Baru" />
      <form onSubmit={submit} noValidate aria-busy={isBusy} className="flex flex-col">
        <h1 className="text-[28px] leading-[1.15] font-bold tracking-[-0.02em]">
          Buat kata sandi baru
        </h1>
        <p className="mt-2 text-[15px] leading-normal text-foreground-secondary">
          Nomor{' '}
          <span className="font-semibold whitespace-nowrap text-foreground">{maskedPhone}</span>{' '}
          terverifikasi.
        </p>
        <Field className="mt-6">
          <FieldLabel htmlFor="reset-password">Kata sandi baru</FieldLabel>
          <PasswordInput
            ref={passwordRef}
            id="reset-password"
            autoComplete="new-password"
            value={password}
            onChange={(value) => {
              setPassword(value)
              if (errors.password) {
                setErrors({ ...errors, password: undefined })
              }
            }}
            isInvalid={!!errors.password}
            describedBy={errors.password ? 'reset-password-error' : 'reset-password-help'}
          />
          {errors.password ? (
            <FieldError id="reset-password-error">{errors.password}</FieldError>
          ) : (
            <FieldDescription id="reset-password-help">Minimal 8 karakter.</FieldDescription>
          )}
        </Field>
        <Field className="mt-4.5">
          <FieldLabel htmlFor="reset-confirmation">Ulangi kata sandi</FieldLabel>
          <PasswordInput
            ref={confirmationRef}
            id="reset-confirmation"
            autoComplete="new-password"
            value={confirmation}
            onChange={(value) => {
              setConfirmation(value)
              if (errors.passwordConfirmation) {
                setErrors({ ...errors, passwordConfirmation: undefined })
              }
            }}
            isInvalid={!!errors.passwordConfirmation}
            describedBy={errors.passwordConfirmation ? 'reset-confirmation-error' : undefined}
          />
          {errors.passwordConfirmation && (
            <FieldError id="reset-confirmation-error">{errors.passwordConfirmation}</FieldError>
          )}
        </Field>
        <Checkbox
          isSelected={shouldLogoutOthers}
          onChange={setLogoutOthers}
          className="mt-3"
          buttonClassName="size-auto min-h-icon-btn justify-start gap-2.5 text-sm leading-[1.4] font-medium"
        >
          Keluarkan dari perangkat lain
        </Checkbox>
        <Button type="submit" size="cta" className="mt-5 w-full" isPending={isBusy}>
          {isBusy ? 'Menyimpan…' : 'Simpan & Masuk'}
        </Button>
      </form>
    </>
  )
}

ResetPassword.layout = [AuthLayout]
