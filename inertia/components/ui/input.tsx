import { type ComponentProps } from 'react'
import { cn } from 'cn'

function Input({ className, type, ...props }: ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-input w-full min-w-0 rounded-md border border-input bg-card px-3.5 text-base text-foreground transition-[border-color,box-shadow] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground aria-invalid:field-invalid focus-visible:field-focus',
        className
      )}
      {...props}
    />
  )
}

export { Input }
