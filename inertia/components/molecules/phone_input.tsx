import { type Ref } from 'react'
import { InputGroup, InputGroupAddon, InputGroupInput } from '~/components/ui/input_group'
import { formatPhone, phoneDigits } from '~/lib/shared/phone'

export default function PhoneInput({
  ref,
  id,
  value,
  onChange,
  isInvalid,
  describedBy,
}: {
  ref?: Ref<HTMLInputElement>
  id: string
  value: string
  onChange: (digits: string) => void
  isInvalid?: boolean
  describedBy?: string
}) {
  return (
    <InputGroup>
      <InputGroupAddon
        id={`${id}-prefix`}
        className="border-r border-border pr-3 pl-3.25 text-foreground-secondary"
      >
        +62
      </InputGroupAddon>
      <InputGroupInput
        ref={ref}
        id={id}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        placeholder="812 3456 7890"
        className="pl-3!"
        value={formatPhone(value)}
        onChange={(event) => onChange(phoneDigits(event.target.value))}
        aria-invalid={isInvalid ? true : undefined}
        aria-describedby={[`${id}-prefix`, describedBy].filter(Boolean).join(' ')}
      />
    </InputGroup>
  )
}
