import { type ComponentProps } from 'react'
import { Label as LabelPrimitive } from 'react-aria-components'
import { cn } from 'cn'

function Label({ className, ...props }: ComponentProps<typeof LabelPrimitive>) {
  return (
    <LabelPrimitive
      data-slot="label"
      className={cn(
        'flex items-center gap-2 text-sm leading-[1.3] font-semibold select-none group-data-[disabled=true]:pointer-events-none peer-disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  )
}

export { Label }
