import {
  Separator as SeparatorPrimitive,
  type SeparatorProps as SeparatorPrimitiveProps,
} from 'react-aria-components'
import { cn } from 'cn'

function Separator({
  className,
  orientation = 'horizontal',
  ...props
}: Omit<SeparatorPrimitiveProps, 'className'> & { className?: string }) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      className={cn(
        'shrink-0 border-0 bg-border',
        orientation === 'horizontal' ? 'h-px w-full' : 'w-px self-stretch',
        className
      )}
      {...props}
    />
  )
}

export { Separator }
