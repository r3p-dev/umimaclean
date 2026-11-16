import { useRef, type KeyboardEvent, type ClipboardEvent } from 'react'
import { cn } from 'cn'

export default function OtpInput({
  value,
  onChange,
  length = 6,
  label = 'Kode verifikasi',
  isInvalid,
  isDisabled,
  describedBy,
}: {
  value: string
  onChange: (value: string) => void
  length?: number
  label?: string
  isInvalid?: boolean
  isDisabled?: boolean
  describedBy?: string
}) {
  const boxes = useRef<(HTMLInputElement | null)[]>([])

  function focusBox(index: number) {
    const target = Math.max(0, Math.min(index, length - 1))
    boxes.current[target]?.focus()
  }

  function handleDigitChange(index: number, raw: string) {
    const digits = raw.replace(/\D/g, '')
    if (!digits) {
      onChange(value.slice(0, index) + value.slice(index + 1))
      return
    }
    const next = (value.slice(0, Math.min(index, value.length)) + digits).slice(0, length)
    onChange(next)
    focusBox(next.length)
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace') {
      if (!value[index] && index > 0) {
        event.preventDefault()
        onChange(value.slice(0, index - 1))
        focusBox(index - 1)
      }
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      focusBox(index - 1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      focusBox(index + 1)
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault()
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (pasted) {
      onChange(pasted)
      focusBox(pasted.length)
    }
  }

  return (
    <div
      role="group"
      aria-label={`${label} ${length} digit`}
      aria-describedby={describedBy}
      className="grid w-full gap-2"
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
          onChange={(event) => handleDigitChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          onFocus={(event) => event.target.select()}
          className={cn(
            'flex h-13 w-full min-w-0 items-center justify-center rounded-lg border border-input bg-card p-0 text-center font-mono text-xl font-bold text-foreground transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:h-14 sm:text-2xl disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground',
            isInvalid &&
              'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20'
          )}
        />
      ))}
    </div>
  )
}
