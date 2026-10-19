import { type Ref } from 'react'
import AddressCombobox, { type AddressSuggestions } from '~/components/molecules/address_combobox'
import PhoneInput from '~/components/molecules/phone_input'
import { Field, FieldDescription, FieldError, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import type { AddressSuggestion } from '~/lib/location/suggest'
import type { OrderDraft } from '~/lib/order/draft'

export type DetailsField = 'name' | 'phone' | 'address'

export default function CustomerDetailsFields({
  draft,
  errors,
  nameRef,
  phoneRef,
  addressRef,
  suggestions,
  onChange,
  onAddressFocus,
  onAddressBlur,
  onAddressPick,
}: {
  draft: OrderDraft
  errors: Partial<Record<DetailsField, string>>
  nameRef: Ref<HTMLInputElement>
  phoneRef: Ref<HTMLInputElement>
  addressRef: Ref<HTMLTextAreaElement>
  suggestions: AddressSuggestions
  onChange: (patch: Partial<OrderDraft>) => void
  onAddressFocus: () => void
  onAddressBlur: () => void
  onAddressPick: (suggestion: AddressSuggestion) => void
}) {
  return (
    <div className="flex flex-col gap-5">
      <Field>
        <FieldLabel htmlFor="order-name">Nama</FieldLabel>
        <Input
          ref={nameRef}
          id="order-name"
          autoComplete="name"
          value={draft.name}
          onChange={(event) => onChange({ name: event.target.value.slice(0, 80) })}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? 'order-name-error' : undefined}
        />
        {errors.name && <FieldError id="order-name-error">{errors.name}</FieldError>}
      </Field>
      <Field>
        <FieldLabel htmlFor="order-phone">Nomor WhatsApp</FieldLabel>
        <PhoneInput
          ref={phoneRef}
          id="order-phone"
          value={draft.phone}
          onChange={(phone) => onChange({ phone })}
          invalid={!!errors.phone}
          describedBy={errors.phone ? 'order-phone-error' : 'order-phone-help'}
        />
        {errors.phone ? (
          <FieldError id="order-phone-error">{errors.phone}</FieldError>
        ) : (
          <FieldDescription id="order-phone-help">
            Kode verifikasi akan dikirim ke nomor ini via WhatsApp.
          </FieldDescription>
        )}
      </Field>
      <Field>
        <FieldLabel htmlFor="order-address">Alamat</FieldLabel>
        <AddressCombobox
          id="order-address"
          inputRef={addressRef}
          value={draft.address}
          suggestions={suggestions}
          invalid={!!errors.address}
          describedBy={errors.address ? 'order-address-error' : 'order-address-help'}
          onChange={(address) => onChange({ address })}
          onPick={onAddressPick}
          onFocus={onAddressFocus}
          onBlur={onAddressBlur}
        />
        {errors.address ? (
          <FieldError id="order-address-error">{errors.address}</FieldError>
        ) : (
          <FieldDescription id="order-address-help">
            Pilih dari saran atau ketik nama jalan, lalu lengkapi nomor rumah dan RT/RW.
          </FieldDescription>
        )}
      </Field>
    </div>
  )
}
