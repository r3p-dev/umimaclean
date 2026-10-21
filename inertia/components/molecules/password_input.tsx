import { useState, type Ref } from 'react'
import { IconEye, IconEyeOff } from '@tabler/icons-react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '~/components/ui/input_group'

export default function PasswordInput({
  ref,
  id,
  value,
  onChange,
  autoComplete,
  isInvalid,
  describedBy,
}: {
  ref?: Ref<HTMLInputElement>
  id: string
  value: string
  onChange: (value: string) => void
  autoComplete: 'current-password' | 'new-password'
  isInvalid?: boolean
  describedBy?: string
}) {
  const [isVisible, setVisible] = useState(false)

  return (
    <InputGroup>
      <InputGroupInput
        ref={ref}
        id={id}
        type={isVisible ? 'text' : 'password'}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={isInvalid ? true : undefined}
        aria-describedby={describedBy}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          aria-label={isVisible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
          aria-pressed={isVisible}
          onPress={() => setVisible((wasVisible) => !wasVisible)}
        >
          {isVisible ? <IconEyeOff className="size-5.5" /> : <IconEye className="size-5.5" />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}
