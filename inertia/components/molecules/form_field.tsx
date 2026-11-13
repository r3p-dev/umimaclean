import { Input } from '~/components/ui/input'
import { Field, FieldDescription, FieldError, FieldLabel } from '~/components/ui/field'

export default function FormField({
  id,
  label,
  type = 'text',
  autoComplete,
  description,
  error,
}: {
  id: string
  label: string
  type?: 'text' | 'email' | 'password'
  autoComplete?: string
  description?: string
  error?: string
}) {
  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="h-12 text-base"
      />
      {description && !error && <FieldDescription>{description}</FieldDescription>}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </Field>
  )
}
