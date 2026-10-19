import { IconArrowLeft } from '@tabler/icons-react'
import { LinkButton } from '~/components/ui/button'
import { cn } from '~/lib/shared/utils'

export default function BackLink({
  href,
  label = 'Kembali',
  variant = 'inline',
  className,
}: {
  href: string
  label?: string
  variant?: 'inline' | 'footer'
  className?: string
}) {
  if (variant === 'footer') {
    return (
      <LinkButton
        variant="outline"
        size="cta"
        className={cn('shrink-0 max-sm:w-cta max-sm:px-0', className)}
        href={href}
      >
        <IconArrowLeft className="size-5.5" />
        <span className="max-sm:sr-only">{label}</span>
      </LinkButton>
    )
  }

  return (
    <LinkButton
      variant="ghost"
      size="desktop"
      className={cn(
        '-ml-3 gap-1.5 self-start px-3 font-medium text-foreground-secondary',
        className
      )}
      href={href}
    >
      <IconArrowLeft className="size-5" />
      {label}
    </LinkButton>
  )
}
