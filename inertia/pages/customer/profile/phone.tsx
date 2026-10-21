import { useRef, useState, type FormEvent } from 'react'
import { Head, router } from '@inertiajs/react'
import { urlFor } from '~/client'
import BackLink from '~/components/molecules/back_link'
import PhoneInput from '~/components/molecules/phone_input'
import TurnstileWidget from '~/components/molecules/turnstile_widget'
import ProfileShell from '~/components/organisms/profile/profile_shell'
import AccountLayout from '~/components/templates/account_layout'
import { Button } from '~/components/ui/button'
import { Field, FieldDescription, FieldError, FieldLabel } from '~/components/ui/field'
import { useTurnstile } from '~/lib/shared/turnstile'
import { phoneError } from '~/lib/shared/validation'

type Errors = Partial<Record<'phone' | 'turnstile', string>>

export default function ChangePhone({ currentPhone }: { currentPhone: string }) {
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
      urlFor('customer.phone.store'),
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
      <Head title="Ganti Nomor WhatsApp" />
      <ProfileShell
        active="keamanan"
        title="Ganti nomor WhatsApp"
        back={<BackLink href={urlFor('customer.profile.edit')} label="Ubah profil" />}
      >
        <form
          onSubmit={submit}
          noValidate
          aria-busy={isBusy}
          className="mt-4 flex max-w-120 flex-col gap-4.5 rounded-lg border border-border bg-card p-5 sm:p-6"
        >
          <p className="text-[15px] leading-normal text-foreground-secondary">
            Nomor saat ini <span className="font-semibold text-foreground">{currentPhone}</span>.
            Kami kirim kode verifikasi via WhatsApp ke nomor baru.
          </p>
          <Field>
            <FieldLabel htmlFor="new-phone">Nomor WhatsApp baru</FieldLabel>
            <PhoneInput
              ref={phoneRef}
              id="new-phone"
              value={phone}
              onChange={(value) => {
                setPhone(value)
                if (errors.phone) {
                  setErrors({ ...errors, phone: undefined })
                }
              }}
              isInvalid={!!errors.phone}
              describedBy={errors.phone ? 'new-phone-error' : 'new-phone-help'}
            />
            {errors.phone ? (
              <FieldError id="new-phone-error">{errors.phone}</FieldError>
            ) : (
              <FieldDescription id="new-phone-help">
                Nomor lama tetap dipakai sampai kode terverifikasi.
              </FieldDescription>
            )}
          </Field>
          {turnstile.isEnabled && (
            <div>
              <TurnstileWidget container={turnstile.container} isEnabled={turnstile.isEnabled} />
              {errors.turnstile && <FieldError className="mt-2">{errors.turnstile}</FieldError>}
            </div>
          )}
          <Button type="submit" size="cta" isPending={isBusy}>
            {isBusy ? 'Mengirim kode…' : 'Kirim Kode'}
          </Button>
        </form>
      </ProfileShell>
    </>
  )
}

ChangePhone.layout = [AccountLayout]
