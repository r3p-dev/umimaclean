import { cva, type VariantProps } from 'class-variance-authority'
import {
  Button as ButtonPrimitive,
  Link as LinkPrimitive,
  type ButtonProps as ButtonPrimitiveProps,
  type LinkProps as LinkPrimitiveProps,
} from 'react-aria-components'
import { cn } from 'cn'

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md leading-none font-semibold whitespace-nowrap transition-[color,background-color,border-color,box-shadow,filter] duration-120 select-none disabled:cursor-not-allowed disabled:border-border disabled:bg-disabled disabled:text-disabled-foreground disabled:shadow-none aria-disabled:pointer-events-none aria-disabled:border-border aria-disabled:bg-disabled aria-disabled:text-disabled-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        'default':
          'bg-primary text-primary-foreground hover:bg-primary-hover data-pressed:bg-primary-active',
        'outline':
          'border border-input bg-card text-foreground hover:border-primary hover:bg-accent data-pressed:bg-accent-strong aria-expanded:bg-accent',
        'ghost':
          'text-foreground hover:bg-accent data-pressed:bg-accent-strong aria-expanded:bg-accent disabled:border-transparent disabled:bg-transparent',
        'link':
          'h-auto min-h-icon-btn px-0.5 text-primary underline-offset-3 hover:text-primary-hover hover:underline data-pressed:text-primary-active disabled:border-transparent disabled:bg-transparent',
        'destructive': 'bg-destructive text-destructive-foreground hover:bg-destructive-hover',
        'destructive-outline':
          'border border-destructive-border bg-card text-destructive-text hover:bg-destructive-subtle',
        'success':
          'bg-success-solid text-success-solid-foreground hover:brightness-94 data-pressed:brightness-88',
        'inverse': 'bg-surface-inverse text-surface-inverse-foreground hover:bg-surface-inverse/90',
      },
      size: {
        'default': 'h-btn px-5 text-sm',
        'desktop': 'h-btn-desktop px-3.5 text-sm',
        'compact': 'h-btn-compact px-3 text-note',
        'cta': 'h-cta rounded-cta px-5 text-base',
        'icon': 'size-icon-btn',
        'icon-compact': 'size-btn-compact',
      },
    },
    compoundVariants: [{ variant: 'link', className: 'h-auto min-h-icon-btn px-0.5' }],
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

type ButtonVariantProps = VariantProps<typeof buttonVariants> & {
  className?: string
  title?: string
}

function Button({
  className,
  variant = 'default',
  size = 'default',
  title,
  ...props
}: Omit<ButtonPrimitiveProps, 'className'> & ButtonVariantProps) {
  return (
    <ButtonPrimitive
      render={title ? (domProps) => <button {...domProps} title={title} /> : undefined}
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

function LinkButton({
  className,
  variant = 'default',
  size = 'default',
  title,
  ...props
}: Omit<LinkPrimitiveProps, 'className'> & ButtonVariantProps) {
  return (
    <LinkPrimitive
      render={
        title
          ? (domProps) =>
              'href' in domProps ? (
                <a {...domProps} title={title} />
              ) : (
                <span {...domProps} title={title} />
              )
          : undefined
      }
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, LinkButton, buttonVariants }
