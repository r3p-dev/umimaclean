import { type ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from 'cn'

const alertVariants = cva(
  'group/alert relative grid w-full rounded-md has-data-[slot=alert-title]:gap-y-0.5 text-left has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] *:[svg]:row-span-2 *:[svg]:text-current',
  {
    variants: {
      variant: {
        default: 'border border-border bg-card text-card-foreground',
        info: 'bg-info text-info-foreground',
        attention: 'bg-attention text-attention-foreground',
        success: 'bg-success text-success-foreground',
        destructive: 'bg-destructive-subtle text-destructive-text',
      },
      size: {
        default:
          "px-3.5 py-3 text-sm leading-normal has-[>svg]:gap-x-2.5 *:[svg:not([class*='size-'])]:size-5",
        sm: "px-3 py-2.5 text-note leading-[1.4] has-[>svg]:gap-x-2 *:[svg:not([class*='size-'])]:size-4.5",
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

function Alert({
  className,
  variant,
  size,
  ...props
}: ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role={variant === 'destructive' ? 'alert' : 'status'}
      className={cn(alertVariants({ variant, size }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        'font-semibold group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3',
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        'text-pretty group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_p:not(:last-child)]:mb-4',
        className
      )}
      {...props}
    />
  )
}

function AlertAction({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-action"
      className={cn('absolute top-2.5 right-3', className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
