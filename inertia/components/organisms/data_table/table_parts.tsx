import { useId, type ReactNode } from 'react'
import { IconFilterOff, IconSearchOff, IconX } from '@tabler/icons-react'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'

export function BulkBar({
  label,
  count,
  total,
  canSelectAll,
  onSelectAll,
  onClear,
  children,
}: {
  label: string
  count: number
  total: number
  canSelectAll: boolean
  onSelectAll: () => void
  onClear: () => void
  children?: ReactNode
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex flex-wrap items-center gap-2 border-b border-border bg-row-selected py-2.5 pr-3 pl-4"
    >
      <span role="status" className="text-sm leading-[1.2] font-semibold text-accent-foreground">
        {count} dipilih
      </span>
      {canSelectAll && (
        <Button
          variant="link"
          onPress={onSelectAll}
          className="min-h-0 px-1.5 text-sm leading-none"
        >
          Pilih semua {total} hasil
        </Button>
      )}
      <span className="flex-1" />
      {children}
      <Button variant="ghost" size="compact" onPress={onClear} className="text-[13.5px]">
        <IconX className="size-4.5" />
        Kosongkan pilihan
      </Button>
    </div>
  )
}

export function SelectAllRow({
  state,
  onToggle,
}: {
  state: boolean | 'indeterminate'
  onToggle: () => void
}) {
  return (
    <div className="flex items-center gap-1 border-b border-border py-0.5 pr-4 pl-1 text-[13.5px] leading-[1.2] font-medium text-foreground-secondary sm:hidden">
      <Checkbox
        isSelected={state === true}
        isIndeterminate={state === 'indeterminate'}
        onChange={onToggle}
        aria-label="Pilih semua di halaman ini"
      />
      <span aria-hidden="true">Pilih semua di halaman ini</span>
    </div>
  )
}

export function MobileSort({
  value,
  options,
  onChange,
}: {
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}) {
  const id = useId()
  return (
    <div className="flex items-center gap-2 border-b border-border px-4 py-2 sm:hidden">
      <label
        htmlFor={id}
        className="text-[13.5px] leading-none font-medium text-foreground-secondary"
      >
        Urutkan
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-btn-compact flex-1 rounded-md border border-input bg-card px-2 text-base leading-none text-foreground"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function TableEmpty({
  title,
  description,
  onReset,
}: {
  title: string
  description: string
  onReset?: () => void
}) {
  return (
    <div role="status" className="flex flex-col items-center gap-2 px-4 py-9 text-center">
      <IconSearchOff className="size-7 text-icon-muted" />
      <p className="text-[15px] leading-[1.3] font-semibold">{title}</p>
      <p className="text-note leading-[1.4] text-foreground-secondary">{description}</p>
      {onReset && (
        <Button variant="outline" size="compact" onPress={onReset} className="text-[13.5px]">
          <IconFilterOff className="size-4.5" />
          Reset filter
        </Button>
      )}
    </div>
  )
}

export function FilterSummary({ text, onReset }: { text: string; onReset: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-meta leading-[1.4] text-foreground-secondary">
      <span role="status">{text}</span>
      <Button variant="ghost" size="compact" onPress={onReset} className="text-[13.5px]">
        <IconFilterOff className="size-4.5" />
        Reset filter
      </Button>
    </div>
  )
}

export const TABLE_HEAD_ROW =
  'text-left text-xs leading-none font-semibold tracking-[0.05em] text-muted-foreground uppercase'

export const CHECK_CELL = 'w-13 py-0.5 pr-0 pl-2 first:pl-2'
