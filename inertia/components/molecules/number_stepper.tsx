import { IconMinus, IconPlus } from '@tabler/icons-react'
import { Button, Group, I18nProvider, Input, NumberField } from 'react-aria-components'

const STEP_BUTTON =
  'flex size-10 items-center justify-center text-foreground outline-none hover:bg-muted focus-visible:bg-muted data-disabled:opacity-40'

// A whole number with − and + buttons (React Aria NumberField; the shadcn registry has none, D105).
export default function NumberStepper({
  id,
  label,
  value,
  onChange,
  minValue,
  maxValue,
}: {
  id: string
  label: string
  value: number
  onChange: (value: number) => void
  minValue: number
  maxValue: number
}) {
  return (
    <I18nProvider locale="id-ID">
      <NumberField
        value={value}
        onChange={(next) => onChange(Number.isNaN(next) ? minValue : next)}
        minValue={minValue}
        maxValue={maxValue}
        aria-label={label}
      >
        <Group className="flex h-10 items-center overflow-hidden rounded-md border border-input bg-card focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
          <Button slot="decrement" className={STEP_BUTTON}>
            <IconMinus aria-hidden="true" className="size-4" />
          </Button>
          <Input
            id={id}
            className="h-full w-10 bg-transparent text-center text-base tabular-nums outline-none"
          />
          <Button slot="increment" className={STEP_BUTTON}>
            <IconPlus aria-hidden="true" className="size-4" />
          </Button>
        </Group>
      </NumberField>
    </I18nProvider>
  )
}
