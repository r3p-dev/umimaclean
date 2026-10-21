import { type ReactNode } from 'react'
import { IconCircle, IconCircleDot, IconSquare, IconSquareCheckFilled } from '@tabler/icons-react'
import { cn } from '~/lib/shared/utils'

const TONES = {
  primary: {
    on: 'border-primary bg-accent text-accent-foreground shadow-[inset_0_0_0_1px_var(--primary)]',
    mark: 'text-primary',
  },
  destructive: {
    on: 'border-destructive-border bg-destructive-surface text-foreground shadow-[inset_0_0_0_1px_var(--destructive-border)] font-semibold',
    mark: 'text-destructive-text',
  },
  subtle: {
    on: 'border-primary bg-accent-subtle text-foreground shadow-[inset_0_0_0_1px_var(--primary)]',
    mark: 'text-primary',
  },
}

export default function ChoiceRow({
  role,
  isChecked,
  onChange,
  tone = 'primary',
  markPosition = 'start',
  isDisabled = false,
  className,
  children,
}: {
  role: 'radio' | 'checkbox'
  isChecked: boolean
  onChange?: () => void
  tone?: keyof typeof TONES
  markPosition?: 'start' | 'end'
  isDisabled?: boolean
  className?: string
  children: ReactNode
}) {
  const Mark =
    role === 'radio'
      ? isChecked
        ? IconCircleDot
        : IconCircle
      : isChecked
        ? IconSquareCheckFilled
        : IconSquare
  const mark = (
    <Mark
      className={cn(
        'shrink-0',
        markPosition === 'end' ? 'size-5.5' : 'size-5',
        isChecked ? TONES[tone].mark : 'text-icon-muted'
      )}
    />
  )

  return (
    <button
      type="button"
      role={role}
      aria-checked={isChecked}
      aria-disabled={isDisabled || undefined}
      onClick={isDisabled ? undefined : onChange}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-md border px-3.5 text-left text-[14.5px] leading-[1.3] font-medium transition-[background-color,border-color,box-shadow] duration-120',
        isChecked ? TONES[tone].on : 'border-border-strong bg-card text-foreground',
        isDisabled ? 'cursor-default' : !isChecked && 'hover:border-primary hover:bg-accent',
        className
      )}
    >
      {markPosition === 'start' && mark}
      {children}
      {markPosition === 'end' && mark}
    </button>
  )
}
