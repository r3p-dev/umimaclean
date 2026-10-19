import { type ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from 'cn'

import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'

function InputGroup({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        'group/input-group relative flex h-12.5 w-full min-w-0 items-center overflow-hidden rounded-md border border-input bg-card text-base transition-[border-color,box-shadow] has-[[data-slot][aria-invalid=true]]:field-invalid has-[[data-slot=input-group-control]:focus-visible]:field-focus has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>textarea]:h-auto has-[>[data-align=inline-end]]:[&>input]:pr-1.5 has-[>[data-align=inline-start]]:[&>input]:pl-2.5',
        className
      )}
      {...props}
    />
  )
}

const inputGroupAddonVariants = cva(
  "flex h-full cursor-text items-center justify-center gap-2 text-base font-medium text-muted-foreground select-none [&>svg:not([class*='size-'])]:size-5",
  {
    variants: {
      align: {
        'inline-start': 'order-first pl-3.5 has-[>button]:pl-0.5',
        'inline-end': 'order-last pr-3.5 has-[>button]:pr-0.5',
        'block-start': 'order-first h-auto w-full justify-start px-3.5 pt-2.5 [.border-b]:pb-2.5',
        'block-end': 'order-last h-auto w-full justify-start px-3.5 pb-2.5 [.border-t]:pt-2.5',
      },
    },
    defaultVariants: {
      align: 'inline-start',
    },
  }
)

function InputGroupAddon({
  className,
  align = 'inline-start',
  ...props
}: ComponentProps<'div'> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) {
          return
        }
        e.currentTarget.parentElement?.querySelector('input')?.focus()
      }}
      {...props}
    />
  )
}

const inputGroupButtonVariants = cva('shadow-none', {
  variants: {
    size: {
      compact: 'h-btn-compact rounded-inner px-3',
      icon: 'size-icon-btn rounded-inner p-0',
    },
  },
  defaultVariants: {
    size: 'icon',
  },
})

function InputGroupButton({
  className,
  type = 'button',
  variant = 'ghost',
  size = 'icon',
  ...props
}: Omit<ComponentProps<typeof Button>, 'size'> & VariantProps<typeof inputGroupButtonVariants>) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  )
}

function InputGroupText({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        "flex h-full items-center gap-2 text-foreground-secondary [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5",
        className
      )}
      {...props}
    />
  )
}

function InputGroupInput({ className, ...props }: ComponentProps<'input'>) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        'h-full flex-1 rounded-none border-0 bg-transparent focus-visible:outline-none aria-invalid:border-0',
        className
      )}
      {...props}
    />
  )
}

function InputGroupTextarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(
        'flex-1 rounded-none border-0 bg-transparent focus-visible:outline-none aria-invalid:border-0',
        className
      )}
      {...props}
    />
  )
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
}
