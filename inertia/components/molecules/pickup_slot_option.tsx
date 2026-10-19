import { IconCircle, IconCircleDot } from '@tabler/icons-react'
import { cn } from '~/lib/shared/utils'

export default function PickupSlotOption({
  label,
  checked,
  full,
  onPick,
}: {
  label: string
  checked: boolean
  full: boolean
  onPick: () => void
}) {
  return (
    <label
      className={cn(
        'flex h-13 w-full items-center justify-between rounded-md text-[15px] leading-none has-focus-visible:focus-ring',
        checked
          ? 'border-2 border-primary bg-accent px-3.5 font-semibold text-accent-foreground'
          : full
            ? 'cursor-not-allowed border border-border bg-disabled px-3.75 font-medium text-disabled-foreground'
            : 'cursor-pointer border border-border-strong bg-card px-3.75 font-medium hover:bg-accent'
      )}
    >
      <input
        type="radio"
        name="pickup-slot"
        value={label}
        checked={checked}
        disabled={full}
        onChange={onPick}
        aria-label={`${label}${full ? ', penuh' : ''}`}
        className="sr-only"
      />
      {label.replace('–', ' – ')}
      {full ? (
        <span className="text-caption leading-none font-medium">Penuh</span>
      ) : checked ? (
        <IconCircleDot className="size-5 text-primary" />
      ) : (
        <IconCircle className="size-5 text-icon-muted" />
      )}
    </label>
  )
}
