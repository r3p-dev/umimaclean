import { IconCircle, IconCircleDot } from '@tabler/icons-react'
import { cn } from '~/lib/shared/utils'

export default function PickupSlotOption({
  label,
  isChecked,
  isFull,
  onPick,
}: {
  label: string
  isChecked: boolean
  isFull: boolean
  onPick: () => void
}) {
  return (
    <label
      className={cn(
        'flex h-13 w-full items-center justify-between rounded-md text-[15px] leading-none has-focus-visible:focus-ring',
        isChecked
          ? 'border-2 border-primary bg-accent px-3.5 font-semibold text-accent-foreground'
          : isFull
            ? 'cursor-not-allowed border border-border bg-disabled px-3.75 font-medium text-disabled-foreground'
            : 'cursor-pointer border border-border-strong bg-card px-3.75 font-medium hover:bg-accent'
      )}
    >
      <input
        type="radio"
        name="pickup-slot"
        value={label}
        checked={isChecked}
        disabled={isFull}
        onChange={onPick}
        aria-label={`${label}${isFull ? ', penuh' : ''}`}
        className="sr-only"
      />
      {label.replace('–', ' – ')}
      {isFull ? (
        <span className="text-caption leading-none font-medium">Penuh</span>
      ) : isChecked ? (
        <IconCircleDot className="size-5 text-primary" />
      ) : (
        <IconCircle className="size-5 text-icon-muted" />
      )}
    </label>
  )
}
