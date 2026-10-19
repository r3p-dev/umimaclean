import { type ReactNode } from 'react'
import {
  Dialog as DialogPrimitive,
  DialogTrigger,
  Popover as PopoverPrimitive,
  type DialogTriggerProps,
  type PopoverProps as PopoverPrimitiveProps,
} from 'react-aria-components'
import { cn } from 'cn'

function PopoverTrigger(props: DialogTriggerProps) {
  return <DialogTrigger {...props} />
}

function Popover({
  className,
  children,
  placement = 'bottom start',
  offset = 6,
  containerPadding = 16,
  'aria-label': ariaLabel,
  ...props
}: Omit<PopoverPrimitiveProps, 'className' | 'children'> & {
  'className'?: string
  'children': ReactNode
  'aria-label'?: string
}) {
  return (
    <PopoverPrimitive
      data-slot="popover-content"
      placement={placement}
      offset={offset}
      containerPadding={containerPadding}
      className={cn(
        'z-50 flex w-[min(280px,calc(100vw-32px))] origin-(--trigger-anchor-point) flex-col rounded-md border border-border bg-popover p-1.5 text-popover-foreground shadow-1 outline-hidden duration-100 data-entering:animate-in data-entering:fade-in-0 data-entering:zoom-in-95 data-exiting:animate-out data-exiting:fade-out-0 data-exiting:zoom-out-95',
        className
      )}
      {...props}
    >
      <DialogPrimitive aria-label={ariaLabel} className="flex flex-col outline-none">
        {children}
      </DialogPrimitive>
    </PopoverPrimitive>
  )
}

export { Popover, PopoverTrigger }
