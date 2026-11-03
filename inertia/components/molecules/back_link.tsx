import { IconArrowLeft } from '@tabler/icons-react'
import { LinkButton } from '~/components/ui/button'
import { cn } from '~/lib/shared/utils'

export default function BackLink({
  href,
  label = 'Kembali',
  className,
}: {
  href: string
  label?: string
  className?: string
}) {
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
