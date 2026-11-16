import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Field, FieldDescription, FieldError, FieldLabel } from '~/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '~/components/ui/input_group'
import { formatLocalPhoneInput, extractLocalDigits } from '~/lib/phone'

export interface PhoneInputProps {
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

export default function PhoneInput({
  id,
  name,
  label,
  defaultValue = '',
  value,
  onChange,
  error,
  description,
  required,
  autoFocus,
  autoComplete = 'tel',
  placeholder = '812 3456 7890',
  className,
}: PhoneInputProps) {
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = useState(() => formatLocalPhoneInput(defaultValue))

  const displayValue = isControlled ? formatLocalPhoneInput(value) : internalValue
  const inputRef = useRef<HTMLInputElement>(null)

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const formatted = formatLocalPhoneInput(e.target.value)
    if (!isControlled) {
      setInternalValue(formatted)
    }
    const digits = extractLocalDigits(e.target.value)
    onChange?.(digits)
  }

  useEffect(() => {
    const input = inputRef.current
    if (!input) {
      return
    }
    const form = input.form
    if (!form) {
      return
    }

    function handleSubmit() {
      if (input) {
        input.value = extractLocalDigits(input.value)
      }
    }

    form.addEventListener('submit', handleSubmit)
    return () => form.removeEventListener('submit', handleSubmit)
  }, [])

  return (
    <Field data-invalid={error ? true : undefined} className={className}>
      {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
      <InputGroup className="h-12">
        <InputGroupAddon align="inline-start" className="text-muted-foreground font-medium pl-3">
          +62
        </InputGroupAddon>
        <InputGroupInput
          ref={inputRef}
          id={id}
          name={name || id}
          type="tel"
          inputMode="numeric"
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          value={displayValue}
          onChange={handleChange}
          className="h-full"
          required={required}
          autoFocus={autoFocus}
        />
      </InputGroup>
      {description && !error && <FieldDescription>{description}</FieldDescription>}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </Field>
  )
}
