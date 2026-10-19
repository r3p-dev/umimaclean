import { type FormEvent, type Ref } from 'react'
import { IconShieldLock } from '@tabler/icons-react'
import { urlFor } from '~/client'
import BackLink from '~/components/molecules/back_link'
import { Button } from '~/components/ui/button'
import { Field, FieldError, FieldLabel } from '~/components/ui/field'
import InfoNote from '~/components/molecules/info_note'
import PhoneInput from '~/components/molecules/phone_input'

export default function PhoneSignInCard({
  inputRef,
  phone,
  error,
  busy,
  onPhoneChange,
  onSubmit,
}: {
  inputRef: Ref<HTMLInputElement>
  phone: string
  error: string | null
  busy: boolean
  onPhoneChange: (phone: string) => void
  onSubmit: (event: FormEvent) => void
}) {
  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="bg-card pt-2 pb-1 sm:mx-auto sm:my-10 sm:box-content sm:max-w-120 sm:rounded-[18px] sm:border sm:border-border"
    >
      <div className="flex flex-col gap-2 px-5 pt-6">
        <h1 className="text-[26px] leading-[1.2] font-bold tracking-[-0.015em]">
          Lacak pesanan &amp; lihat riwayat
        </h1>
        <p className="text-[15px] leading-normal text-foreground-secondary">
          Masukkan nomor WhatsApp yang dipakai saat memesan. Kami kirim kode verifikasi ke nomor
          tersebut.
        </p>
      </div>
      <Field className="px-5 pt-6">
        <FieldLabel htmlFor="track-phone">Nomor WhatsApp</FieldLabel>
        <PhoneInput
          ref={inputRef}
          id="track-phone"
          value={phone}
          onChange={onPhoneChange}
          invalid={!!error}
          describedBy={error ? 'track-phone-error' : undefined}
        />
        {error && <FieldError id="track-phone-error">{error}</FieldError>}
      </Field>
      <div className="flex flex-col gap-1.5 px-5 pt-5">
        <Button type="submit" size="cta" className="w-full" isDisabled={busy} aria-busy={busy}>
          {busy ? 'Mengirim kode…' : 'Kirim Kode via WhatsApp'}
        </Button>
        <BackLink href={urlFor('home')} label="Kembali ke Beranda" className="ml-0 self-stretch" />
      </div>
      <InfoNote icon={IconShieldLock} className="mx-5 mt-5 mb-6">
        <strong className="font-semibold text-foreground">Kenapa perlu kode?</strong> Agar alamat
        dan riwayat pesanan Anda tidak bisa dibuka orang lain yang mengetahui nomor Anda.
      </InfoNote>
    </form>
  )
}
