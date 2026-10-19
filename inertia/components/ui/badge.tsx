import { type ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from 'cn'

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-pill leading-none font-semibold whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:shrink-0 [&>svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        muted: 'bg-muted text-foreground-secondary',
        outline: 'border border-border-strong text-foreground',
        info: 'bg-info text-info-foreground',
        attention: 'bg-attention text-attention-foreground',
        success: 'bg-success text-success-foreground',
        destructive: 'bg-destructive-subtle text-destructive-text',
        inverse: 'bg-surface-inverse text-surface-inverse-foreground',
      },
      size: {
        default: 'h-badge px-2.5 text-caption',
        sm: 'h-5.5 gap-1.25 px-2 text-xs',
        lg: 'h-7 px-2.75 text-caption',
        chip: 'h-9 px-3.25 text-sm font-medium',
        tag: 'h-badge rounded-sm px-2 text-2xs font-bold tracking-[0.04em] uppercase',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

function Badge({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
