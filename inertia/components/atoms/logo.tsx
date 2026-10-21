import { cn } from '~/lib/shared/utils'
import LogoFull from '~/assets/brand/umima-logo.svg?react'
import LogoIcon from '~/assets/brand/umima-icon.svg?react'

const fullSizes = { sm: 'h-10', md: 'h-12', lg: 'h-16', xl: 'h-20' }
const iconSizes = { sm: 'size-6', md: 'size-8', lg: 'size-10' }

type LogoProps = {
  tone?: 'default' | 'inverse'
  isDecorative?: boolean
  className?: string
} & (
  | { variant?: 'full'; size?: keyof typeof fullSizes }
  | { variant: 'icon'; size?: keyof typeof iconSizes }
)

export default function Logo({
  variant = 'full',
  size = 'sm',
  tone = 'default',
  isDecorative = false,
  className,
}: LogoProps) {
  const isIcon = variant === 'icon'
  const Svg = isIcon ? LogoIcon : LogoFull
  const sizeClass = isIcon
    ? iconSizes[size as keyof typeof iconSizes]
    : fullSizes[size as keyof typeof fullSizes]

  return (
    <Svg
      role={isDecorative ? undefined : 'img'}
      aria-label={isDecorative ? undefined : 'Umima'}
      aria-hidden={isDecorative ? true : undefined}
      className={cn(
        'block shrink-0 overflow-visible',
        !isIcon && 'aspect-[2.78672] w-auto',
        sizeClass,
        tone === 'inverse' ? 'text-logo-inverse' : 'text-logo',
        className
      )}
    />
  )
}
