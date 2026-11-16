import { Input } from '~/components/ui/input'
import { Field, FieldDescription, FieldError, FieldLabel } from '~/components/ui/field'

export default function FormField({
  id,
  label,
  type = 'text',
  autoComplete,
  description,
  error,
  required,
}: {
  id: string
  label: string
  type?: 'text' | 'email' | 'password' | 'tel'
  autoComplete?: string
  description?: string
  error?: string
  required?: boolean
}) {
  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="h-12 text-base"
      />
      {description && !error && <FieldDescription>{description}</FieldDescription>}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </Field>
  )
}
