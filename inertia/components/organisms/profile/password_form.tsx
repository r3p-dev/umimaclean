import { useRef, useState, type SubmitEvent } from 'react'
import { router } from '@inertiajs/react'
import PasswordInput from '~/components/molecules/password_input'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '~/components/ui/card'
import { Field, FieldDescription, FieldError, FieldLabel } from '~/components/ui/field'
import { passwordError } from '~/lib/shared/validation'

type PasswordField = 'currentPassword' | 'password' | 'passwordConfirmation'

export default function PasswordForm({ action }: { action: string }) {
  const empty = { currentPassword: '', password: '', passwordConfirmation: '' }
  const [values, setValues] = useState(empty)
  const [errors, setErrors] = useState<Partial<Record<PasswordField, string>>>({})
  const [isBusy, setBusy] = useState(false)
  const refs = {
    currentPassword: useRef<HTMLInputElement>(null),
    password: useRef<HTMLInputElement>(null),
    passwordConfirmation: useRef<HTMLInputElement>(null),
  }
  const fields: {
    key: PasswordField
    label: string
    help?: string
    autoComplete: 'current-password' | 'new-password'
  }[] = [
    { key: 'currentPassword', label: 'Kata sandi saat ini', autoComplete: 'current-password' },
    {
      key: 'password',
      label: 'Kata sandi baru',
      help: 'Minimal 8 karakter.',
      autoComplete: 'new-password',
    },
    { key: 'passwordConfirmation', label: 'Ulangi kata sandi baru', autoComplete: 'new-password' },
  ]

  function focusFirst(found: Partial<Record<PasswordField, string>>) {
    const first = fields.find((field) => found[field.key])
    if (first) {
      refs[first.key].current?.focus()
    }
  }

  function submit(event: SubmitEvent) {
    event.preventDefault()
    if (isBusy) {
      return
    }
    const found: Partial<Record<PasswordField, string>> = {}
    if (!values.currentPassword) {
      found.currentPassword = 'Kata sandi saat ini wajib diisi.'
    }
    const problem = passwordError(values.password)
    if (problem) {
      found.password = problem
    } else if (values.passwordConfirmation !== values.password) {
      found.passwordConfirmation = 'Kata sandi tidak sama.'
    }
    setErrors(found)
    if (Object.keys(found).length) {
      return focusFirst(found)
    }
    router.put(action, values, {
      preserveScroll: true,
      onStart: () => setBusy(true),
      onSuccess: () => setValues(empty),
      onError: (serverErrors) => {
        setErrors(serverErrors)
        focusFirst(serverErrors)
      },
      onFinish: () => setBusy(false),
    })
  }

  return (
    <form id="kata-sandi" onSubmit={submit} noValidate aria-labelledby="password-title">
      <Card>
        <CardHeader>
          <CardTitle as="h2" id="password-title">
            Ubah kata sandi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {fields.map((field) => (
            <Field key={field.key}>
              <FieldLabel htmlFor={`password-${field.key}`}>{field.label}</FieldLabel>
              <PasswordInput
                ref={refs[field.key]}
                id={`password-${field.key}`}
                autoComplete={field.autoComplete}
                value={values[field.key]}
                onChange={(value) => {
                  setValues({ ...values, [field.key]: value })
                  if (errors[field.key]) {
                    setErrors({ ...errors, [field.key]: undefined })
                  }
                }}
                isInvalid={!!errors[field.key]}
                describedBy={
                  errors[field.key]
                    ? `password-${field.key}-error`
                    : field.help
                      ? `password-${field.key}-help`
                      : undefined
                }
              />
              {errors[field.key] ? (
                <FieldError id={`password-${field.key}-error`}>{errors[field.key]}</FieldError>
              ) : (
                field.help && (
                  <FieldDescription id={`password-${field.key}-help`}>
                    {field.help}
                  </FieldDescription>
                )
              )}
            </Field>
          ))}
          <p className="text-meta text-muted-foreground">
            Setelah diganti, perangkat lain dikeluarkan dan harus masuk lagi.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            size="desktop"
            className="px-4 max-sm:h-btn max-sm:w-full"
            isPending={isBusy}
          >
            {isBusy ? 'Menyimpan…' : 'Ubah Kata Sandi'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
