import { type ComponentProps } from 'react'
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
        'group/card flex flex-col gap-3.5 overflow-hidden rounded-lg border border-border bg-card py-(--card-spacing) text-sm text-card-foreground [--card-spacing:--spacing(5)] has-[>img:first-child]:pt-0 has-[>[data-bleed]:first-child]:pt-0 has-[>[data-bleed]:last-child]:pb-0 data-[size=sm]:[--card-spacing:--spacing(4)] *:[img:first-child]:rounded-t-lg *:[img:last-child]:rounded-b-lg',
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
      className={cn(
        'group/card-header @container/card-header grid auto-rows-min items-start gap-1 px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)',
        className
      )}
      {...props}
    />
  )
}

function CardTitle({
  as: Tag = 'div',
  className,
  ...props
}: ComponentProps<'div'> & { as?: 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' }) {
  return (
    <Tag
      data-slot="card-title"
      className={cn('font-heading text-md leading-[1.3] font-semibold', className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-meta text-muted-foreground', className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        'col-start-2 row-span-2 row-start-1 -my-3 flex min-h-icon-btn items-center self-start justify-self-end group-data-[size=sm]/card:-my-2.5',
        className
      )}
      {...props}
    />
  )
}

// <CardContent data-bleed> holds edge-to-edge content (tables, maps, camera, full-width rows):
// - it drops its side padding and inner gap; rows inside pad themselves with px-(--card-spacing).
// - Card drops its top padding when a bleed block is its first child and its bottom padding
//   when it is the last, so the content touches the rounded border (overflow-hidden clips it).
// - directly after <CardHeader className="border-b"> it cancels the slot gap, so the content
//   starts at the header line; after a header without a border the normal gap stays.
// - the Table primitive pads its first and last cells with --card-spacing, so columns line up
//   with the card title without extra classes.
function CardContent({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        'flex flex-col gap-3.5 px-(--card-spacing) data-bleed:gap-0 data-bleed:px-0 data-bleed:[.border-b+&]:-mt-3.5',
        className
      )}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        'flex flex-wrap items-center gap-2.5 px-(--card-spacing) [.border-t]:pt-(--card-spacing)',
        className
      )}
      {...props}
    />
  )
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent }
