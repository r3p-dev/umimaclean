import { useRef, type KeyboardEvent } from 'react'
import { cn } from '~/lib/shared/utils'

export default function OtpInput({
  value,
  onChange,
  length = 6,
  isInvalid,
  isDisabled,
  describedBy,
}: {
  value: string
  onChange: (value: string) => void
  length?: number
  isInvalid?: boolean
  isDisabled?: boolean
  describedBy?: string
}) {
  const boxes = useRef<(HTMLInputElement | null)[]>([])

  function focusBox(index: number) {
    boxes.current[Math.max(0, Math.min(index, length - 1))]?.focus()
  }

  function change(index: number, raw: string) {
    const typed = raw.replace(/\D/g, '')
    if (!typed) {
      onChange(value.slice(0, index) + value.slice(index + 1))
      return
    }
    const next = (value.slice(0, Math.min(index, value.length)) + typed).slice(0, length)
    onChange(next)
    focusBox(next.length)
  }

  function keyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !value[index] && index > 0) {
      event.preventDefault()
      onChange(value.slice(0, index - 1))
      focusBox(index - 1)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      focusBox(index - 1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      focusBox(index + 1)
    }
  }

  return (
    <div
      role="group"
      aria-label={`Kode verifikasi ${length} digit`}
      aria-describedby={describedBy}
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` }}
    >
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(element) => {
            boxes.current[index] = element
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          aria-label={`Digit ${index + 1} dari ${length}`}
          aria-invalid={isInvalid ? true : undefined}
          disabled={isDisabled}
          value={value[index] ?? ''}
          onChange={(event) => change(index, event.target.value)}
          onKeyDown={(event) => keyDown(index, event)}
          onFocus={(event) => event.target.select()}
          className={cn(
            'h-otp w-full min-w-0 rounded-md border border-input bg-card p-0 text-center font-mono text-[22px] leading-none font-semibold text-foreground transition-[border-color,box-shadow] focus-visible:field-focus disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground',
            isInvalid && 'field-invalid bg-destructive-surface'
          )}
        />
      ))}
    </div>
  )
}
