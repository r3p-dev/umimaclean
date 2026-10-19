import { useId, type ComponentType, type SVGProps } from 'react'
import { IconMinus, IconPlus } from '@tabler/icons-react'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/shared/utils'

export default function QuantityStepper({
  label,
  icon: Icon,
  value,
  max = 20,
  onChange,
  className,
  labelClassName,
}: {
  className?: string
  labelClassName?: string
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  value: number
  max?: number
  onChange: (value: number) => void
}) {
  const labelId = useId()
  const name = label.toLowerCase()

  return (
    <div
      className={cn(
        'box-content flex min-h-15 items-center justify-between border-b border-border last:border-b-0',
        className
      )}
    >
      <span
        id={labelId}
        className={cn('flex items-center gap-3 text-base leading-none font-medium', labelClassName)}
      >
        <Icon className="size-6 text-foreground-secondary" />
        {label}
      </span>
      <div role="group" aria-labelledby={labelId} className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={`Kurangi ${name}`}
          isDisabled={value === 0}
          onPress={() => onChange(value - 1)}
          className="size-11.5 border-border-strong"
        >
          <IconMinus className="size-5.5" />
        </Button>
        <output
          aria-live="polite"
          className="w-9 text-center text-[17px] leading-none font-semibold tabular-nums"
        >
          {value}
        </output>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={`Tambah ${name}`}
          isDisabled={value === max}
          onPress={() => onChange(value + 1)}
          className="size-11.5 border-border-strong"
        >
          <IconPlus className="size-5.5" />
        </Button>
      </div>
    </div>
  )
}
