import { useState } from 'react'
import { IconCheck, IconChevronDown } from '@tabler/icons-react'
import { Button } from '~/components/ui/button'
import { CheckboxMark } from '~/components/ui/checkbox'
import { Popover, PopoverTrigger } from '~/components/ui/popover'
import { cn } from '~/lib/shared/utils'

export type FilterOption<T extends string | number> = { value: T; label: string; count?: number }

const TRIGGER =
  'h-btn-desktop gap-1.5 pr-2.5 pl-3 text-[13.5px] font-medium data-[active=true]:border-primary data-[active=true]:bg-accent data-[active=true]:text-accent-foreground'

const ITEM =
  'flex min-h-icon-btn w-full items-center gap-2.5 rounded-inner px-2.5 text-left text-sm leading-[1.2] font-medium text-foreground hover:bg-accent'

function triggerLabel<T extends string | number>(
  word: string,
  options: FilterOption<T>[],
  values: T[]
) {
  if (!values.length) return `${word}: semua`
  if (values.length === 1) {
    return `${word}: ${options.find((option) => option.value === values[0])?.label ?? values[0]}`
  }
  return `${word}: ${values.length} dipilih`
}

export function FilterMenu<T extends string | number>({
  word,
  label,
  options,
  values,
  onChange,
}: {
  word: string
  label: string
  options: FilterOption<T>[]
  values: T[]
  onChange: (values: T[]) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <PopoverTrigger isOpen={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        data-active={values.length > 0}
        className={cn(TRIGGER, 'hover:border-input')}
      >
        {triggerLabel(word, options, values)}
        <IconChevronDown className="size-4.5" />
      </Button>
      <Popover aria-label={label}>
        <div role="group" aria-label={label} className="flex flex-col">
          {options.map((option) => {
            const checked = values.includes(option.value)
            return (
              <button
                key={String(option.value)}
                type="button"
                role="checkbox"
                aria-checked={checked}
                onClick={() =>
                  onChange(
                    checked
                      ? values.filter((value) => value !== option.value)
                      : [...values, option.value]
                  )
                }
                className={cn(ITEM, 'group/check')}
              >
                <CheckboxMark checked={checked} />
                <span className="flex-1">{option.label}</span>
                {option.count !== undefined && (
                  <span className="text-caption leading-none font-medium text-muted-foreground">
                    {option.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
        <div className="mt-1.5 flex items-center justify-between gap-2 border-t border-border px-0.5 pt-1.5">
          <Button variant="ghost" size="compact" onPress={() => onChange([])}>
            Reset
          </Button>
          <Button size="compact" onPress={() => setOpen(false)}>
            Selesai
          </Button>
        </div>
      </Popover>
    </PopoverTrigger>
  )
}

export function SelectMenu<T extends string | number>({
  word,
  label,
  options,
  value,
  onChange,
}: {
  word: string
  label: string
  options: FilterOption<T>[]
  value: T
  onChange: (value: T) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <PopoverTrigger isOpen={open} onOpenChange={setOpen}>
      <Button variant="outline" className={cn(TRIGGER, 'hover:border-input')}>
        {`${word}: ${options.find((option) => option.value === value)?.label ?? value}`}
        <IconChevronDown className="size-4.5" />
      </Button>
      <Popover aria-label={label}>
        <div role="radiogroup" aria-label={label} className="flex flex-col">
          {options.map((option) => {
            const checked = option.value === value
            return (
              <button
                key={String(option.value)}
                type="button"
                role="radio"
                aria-checked={checked}
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
                className={ITEM}
              >
                <span aria-hidden="true" className="flex w-5 text-primary">
                  {checked && <IconCheck className="size-4.5" />}
                </span>
                <span className="flex-1">{option.label}</span>
              </button>
            )
          })}
        </div>
      </Popover>
    </PopoverTrigger>
  )
}
