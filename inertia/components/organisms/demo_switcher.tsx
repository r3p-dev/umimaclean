import { useId } from 'react'
import { cn } from '~/lib/shared/utils'

export default function DemoSwitcher<T extends string | number>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  className?: string
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}) {
  const id = useId()

  if (!import.meta.env.DEV) return null

  return (
    <>
      <div aria-hidden="true" className="h-18 shrink-0" />
      <div
        className={cn(
          'fixed bottom-3 left-3 z-40 flex items-center gap-2 rounded-lg border border-border bg-card py-1.5 pr-1.5 pl-3 shadow-1',
          className
        )}
      >
        <label
          htmlFor={id}
          className="text-2xs font-semibold tracking-[0.06em] text-muted-foreground uppercase"
        >
          Demo
        </label>
        <select
          id={id}
          aria-label={label}
          value={String(value)}
          onChange={(event) => {
            const picked = options.find((option) => String(option.value) === event.target.value)
            if (picked) onChange(picked.value)
          }}
          className="h-btn-compact rounded-md border border-input bg-card px-2 text-sm text-foreground"
        >
          {options.map((option) => (
            <option key={String(option.value)} value={String(option.value)}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </>
  )
}
