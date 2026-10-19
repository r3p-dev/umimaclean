import { cn } from '~/lib/shared/utils'

export const PILL =
  'inline-flex h-btn-compact shrink-0 items-center gap-1.5 rounded-pill border px-3.25 text-[13.5px] leading-none whitespace-nowrap'

export function pillState(on: boolean) {
  return on
    ? 'border-foreground bg-surface-inverse font-semibold text-surface-inverse-foreground'
    : 'border-input bg-card font-medium text-foreground hover:bg-accent'
}

type Option<T extends string | number> = { value: T; label: string }

export default function ChoicePills<T extends string | number>({
  label,
  labelledBy,
  options,
  value,
  onChange,
  multiple = false,
  className,
  pillClassName,
}: {
  label?: string
  labelledBy?: string
  options: Option<T>[]
  value: T | T[] | null
  onChange: (value: T) => void
  multiple?: boolean
  className?: string
  pillClassName?: string
}) {
  const selected = (option: T) => (Array.isArray(value) ? value.includes(option) : value === option)

  return (
    <div
      role={multiple ? 'group' : 'radiogroup'}
      aria-label={label}
      aria-labelledby={labelledBy}
      className={cn('flex flex-wrap gap-1.5', className)}
    >
      {options.map((option) => {
        const on = selected(option.value)
        return (
          <button
            key={String(option.value)}
            type="button"
            role={multiple ? 'checkbox' : 'radio'}
            aria-checked={on}
            onClick={() => onChange(option.value)}
            className={cn(PILL, pillState(on), pillClassName)}
          >
            {multiple && on && <span aria-hidden="true">✓</span>}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
