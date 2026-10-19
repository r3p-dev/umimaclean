import { cn } from '~/lib/shared/utils'

const SIZES = {
  sm: 'size-9 text-sm font-bold',
  md: 'size-11 text-[17px] font-semibold',
  lg: 'size-14 text-xl font-bold',
}

const TONES = {
  accent: 'bg-accent text-info-foreground',
  neutral: 'bg-secondary text-foreground',
  card: 'bg-card text-info-foreground',
}

export default function InitialsAvatar({
  initials,
  size = 'sm',
  tone = 'accent',
  className,
}: {
  initials: string
  size?: keyof typeof SIZES
  tone?: keyof typeof TONES
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full leading-none',
        SIZES[size],
        TONES[tone],
        className
      )}
    >
      {initials}
    </span>
  )
}
