import type { ReactNode } from 'react'
import { parseDateTime, parseTime } from '@internationalized/date'
import { cn } from 'cn'
import { DateField, DateInput, DateSegment, I18nProvider, TimeField } from 'react-aria-components'

// Indonesian order and a 24-hour clock with two-digit hours (09.00), whatever the browser's language (OWN-8, D103).
const LOCALE = 'id-ID'

function Segments() {
  return (
    <DateInput
      data-slot="input"
      className="flex h-11 w-full min-w-0 items-center rounded-md border border-input bg-transparent px-2.5 text-base shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 data-invalid:border-destructive data-invalid:ring-3 data-invalid:ring-destructive/20"
    >
      {(segment) => (
        <DateSegment
          segment={segment}
          className="rounded-sm px-0.5 tabular-nums outline-none focus:bg-primary focus:text-primary-foreground data-placeholder:text-muted-foreground data-[type=literal]:px-0"
        />
      )}
    </DateInput>
  )
}

export function TimeInput({
  value,
  onChange,
  label,
  isInvalid,
  className,
}: {
  value: string
  onChange: (value: string) => void
  label: string
  isInvalid?: boolean
  className?: string
}) {
  return (
    <I18nProvider locale={LOCALE}>
      <TimeField
        value={value ? parseTime(value) : null}
        onChange={(time) => onChange(time ? time.toString().slice(0, 5) : '')}
        hourCycle={24}
        shouldForceLeadingZeros
        aria-label={label}
        isInvalid={isInvalid}
        isRequired
        className={cn('min-w-0', className)}
      >
        <Segments />
      </TimeField>
    </I18nProvider>
  )
}

// A local date and time, "2026-11-19T20:00"; `label` is a FieldLabel, which the field picks up.
export function DateTimeInput({
  value,
  onChange,
  isInvalid,
  label,
}: {
  value: string | null
  onChange: (value: string | null) => void
  isInvalid?: boolean
  label: ReactNode
}) {
  return (
    <I18nProvider locale={LOCALE}>
      <DateField
        value={value ? parseDateTime(value) : null}
        onChange={(date) => onChange(date ? date.toString().slice(0, 16) : null)}
        granularity="minute"
        hourCycle={24}
        shouldForceLeadingZeros
        isInvalid={isInvalid}
        className="flex flex-col gap-2"
      >
        {label}
        <Segments />
      </DateField>
    </I18nProvider>
  )
}
