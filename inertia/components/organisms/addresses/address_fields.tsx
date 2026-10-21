import { type Ref } from 'react'
import AddressCombobox, { type AddressSuggestions } from '~/components/molecules/address_combobox'
import ChoicePills from '~/components/molecules/choice_pills'
import { Field, FieldDescription, FieldError, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import type { AddressSuggestion } from '~/lib/location/suggest'
import { ADDRESS_LABELS } from '~/lib/order/addresses'

export type AddressFormValues = {
  labelChoice: (typeof ADDRESS_LABELS)[number]
  customLabel: string
  addressText: string
  landmark: string
  recipientName: string
}

export type AddressField = 'label' | 'addressText' | 'recipientName'

export default function AddressFields({
  values,
  errors,
  addressRef,
  recipientRef,
  labelRef,
  suggestions,
  onChange,
  onAddressFocus,
  onAddressBlur,
  onAddressPick,
}: {
  values: AddressFormValues
  errors: Partial<Record<AddressField, string>>
  addressRef: Ref<HTMLTextAreaElement>
  recipientRef: Ref<HTMLInputElement>
  labelRef: Ref<HTMLInputElement>
  suggestions: AddressSuggestions
  onChange: (patch: Partial<AddressFormValues>) => void
  onAddressFocus: () => void
  onAddressBlur: () => void
  onAddressPick: (suggestion: AddressSuggestion) => void
}) {
  return (
    <div className="flex flex-col gap-4.5">
      <Field>
        <FieldLabel id="address-label-title">Simpan sebagai</FieldLabel>
        <ChoicePills
          labelledBy="address-label-title"
          options={ADDRESS_LABELS.map((label) => ({ value: label, label }))}
          value={values.labelChoice}
          onChange={(labelChoice) => onChange({ labelChoice })}
          className="gap-2"
          pillClassName="h-btn-compact px-3.5 text-sm"
        />
        {values.labelChoice === 'Lainnya' && (
          <Input
            ref={labelRef}
            aria-label="Nama label"
            placeholder="mis. Rumah Ibu"
            value={values.customLabel}
            onChange={(event) => onChange({ customLabel: event.target.value.slice(0, 30) })}
            aria-invalid={errors.label ? true : undefined}
            aria-describedby={errors.label ? 'address-label-error' : undefined}
          />
        )}
        {errors.label && <FieldError id="address-label-error">{errors.label}</FieldError>}
      </Field>
      <Field>
        <FieldLabel htmlFor="address-text">Alamat lengkap</FieldLabel>
        <AddressCombobox
          id="address-text"
          inputRef={addressRef}
          value={values.addressText}
          suggestions={suggestions}
          isInvalid={!!errors.addressText}
          describedBy={errors.addressText ? 'address-text-error' : 'address-text-help'}
          onChange={(addressText) => onChange({ addressText })}
          onPick={onAddressPick}
          onFocus={onAddressFocus}
          onBlur={onAddressBlur}
        />
        {errors.addressText ? (
          <FieldError id="address-text-error">{errors.addressText}</FieldError>
        ) : (
          <FieldDescription id="address-text-help">
            Nama jalan, nomor rumah, RT/RW, nama gedung.
          </FieldDescription>
        )}
      </Field>
      <Field>
        <FieldLabel htmlFor="address-recipient">Nama penerima</FieldLabel>
        <Input
          ref={recipientRef}
          id="address-recipient"
          autoComplete="name"
          value={values.recipientName}
          onChange={(event) => onChange({ recipientName: event.target.value.slice(0, 80) })}
          aria-invalid={errors.recipientName ? true : undefined}
          aria-describedby={
            errors.recipientName ? 'address-recipient-error' : 'address-recipient-help'
          }
        />
        {errors.recipientName ? (
          <FieldError id="address-recipient-error">{errors.recipientName}</FieldError>
        ) : (
          <FieldDescription id="address-recipient-help">
            Ganti bila yang menyerahkan barang orang lain.
          </FieldDescription>
        )}
      </Field>
    </div>
  )
}
