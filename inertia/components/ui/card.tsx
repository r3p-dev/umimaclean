import type { ComponentProps } from 'react'
import { cn } from 'cn'

function Card({
  className,
  size = 'default',
  ...props
}: ComponentProps<'div'> & { size?: 'default' | 'sm' }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        'group/card flex flex-col gap-3 overflow-hidden rounded-xl border border-border bg-card p-4 text-sm text-card-foreground sm:p-5 data-[size=sm]:p-4',
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn('group/card-header flex flex-col gap-1.5', className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn('text-base leading-normal font-semibold text-foreground', className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div data-slot="card-content" className={cn('flex flex-col gap-3', className)} {...props} />
  )
}

function CardFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div data-slot="card-footer" className={cn('flex items-center pt-1', className)} {...props} />
  )
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
