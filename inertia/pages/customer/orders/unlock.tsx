import { useState, type FormEvent } from 'react'
import { Head, router } from '@inertiajs/react'
import { IconBrandWhatsapp } from '@tabler/icons-react'
import { urlFor } from '~/client'
import InfoNote from '~/components/molecules/info_note'
import OtpInput from '~/components/molecules/otp_input'
import AuthLayout from '~/components/templates/auth_layout'
import { Button } from '~/components/ui/button'
import { FieldError } from '~/components/ui/field'

const DIGITS = 4

export default function UnlockOrder({ id, number }: { id: number; number: string }) {
  const [digits, setDigits] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isBusy, setBusy] = useState(false)

  function unlock(value = digits) {
    if (value.length < DIGITS || isBusy) {
      return
    }
    router.post(
      urlFor('customer.orders.unlock', { id }),
      { digits: value },
      {
        preserveScroll: true,
        onStart: () => setBusy(true),
        onError: (errors) => {
          setError(errors.digits ?? 'Nomor tidak cocok.')
          setDigits('')
        },
        onFinish: () => setBusy(false),
      }
    )
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    unlock()
  }

  return (
    <>
      <Head title={`Lacak ${number}`} />
      <form onSubmit={submit} noValidate aria-busy={isBusy} className="flex flex-col">
        <h1 className="text-[28px] leading-[1.15] font-bold tracking-[-0.02em]">
          Lacak pesanan <span className="font-mono">{number}</span>
        </h1>
        <p className="mt-2 text-[15px] leading-normal text-foreground-secondary">
          Masukkan 4 digit terakhir nomor WhatsApp yang dipakai saat memesan.
        </p>
        <InfoNote icon={IconBrandWhatsapp} tone="accent" className="mt-4">
          Nomornya sama dengan nomor yang menerima pesan dari Umima Clean.
        </InfoNote>
        <div className="mt-6 flex flex-col gap-2">
          <OtpInput
            value={digits}
            onChange={(next) => {
              setDigits(next)
              setError(null)
              if (next.length === DIGITS) {
                unlock(next)
              }
            }}
            length={DIGITS}
            label="4 digit terakhir nomor WhatsApp"
            isInvalid={!!error}
            isDisabled={isBusy}
            describedBy={error ? 'unlock-error' : undefined}
          />
          {error && <FieldError id="unlock-error">{error}</FieldError>}
        </div>
        <Button
          type="submit"
          size="cta"
          className="mt-5 w-full"
          isDisabled={digits.length < DIGITS || isBusy}
          isPending={isBusy}
        >
          Lihat Pesanan
        </Button>
      </form>
    </>
  )
}

UnlockOrder.layout = [AuthLayout]
