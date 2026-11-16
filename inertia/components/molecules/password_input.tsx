import { useState } from 'react'
import { IconEye, IconEyeOff } from '@tabler/icons-react'
import { Field, FieldDescription, FieldError, FieldLabel } from '~/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '~/components/ui/input_group'

export interface PasswordInputProps {
  id: string
  name?: string
  label?: string
  defaultValue?: string
  value?: string
  onChange?: (value: string) => void
  error?: string
  description?: string
  required?: boolean
  autoFocus?: boolean
  autoComplete?: string
  placeholder?: string
  className?: string
}

export default function PasswordInput({
  id,
  name,
  label,
  defaultValue,
  value,
  onChange,
  error,
  description,
  required,
  autoFocus,
  autoComplete = 'current-password',
  placeholder,
  className,
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false)

  function toggleVisibility() {
    setIsVisible((prev) => !prev)
  }

  return (
    <Field data-invalid={error ? true : undefined} className={className}>
      {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
      <InputGroup className="h-12">
        <InputGroupInput
          id={id}
          name={name || id}
          type={isVisible ? 'text' : 'password'}
          defaultValue={defaultValue}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="h-full pr-1.5"
          required={required}
          autoFocus={autoFocus}
        />
        <InputGroupAddon align="inline-end" className="pr-1">
          <InputGroupButton
            type="button"
            size="icon"
            variant="ghost"
            aria-label={isVisible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
            aria-pressed={isVisible}
            onPress={toggleVisibility}
            className="text-muted-foreground hover:text-foreground"
          >
            {isVisible ? <IconEyeOff className="size-5" /> : <IconEye className="size-5" />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {description && !error && <FieldDescription>{description}</FieldDescription>}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </Field>
  )
}
