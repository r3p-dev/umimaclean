import { type ComponentProps } from 'react'
import { cn } from 'cn'

function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex min-h-21 w-full resize-none rounded-md border border-input bg-card px-3.5 py-3 text-base leading-[1.45] text-foreground disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground aria-invalid:field-invalid focus-visible:field-focus',
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
