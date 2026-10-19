import type { ComponentProps, ReactNode } from 'react'
import {
  Dialog as DialogPrimitive,
  Heading,
  Modal as ModalPrimitive,
  ModalOverlay as ModalOverlayPrimitive,
  type DialogProps as DialogPrimitiveProps,
  type ModalOverlayProps,
} from 'react-aria-components'
import { cn } from 'cn'

import { Button } from '~/components/ui/button'

function SheetClose(props: Omit<ComponentProps<typeof Button>, 'slot'>) {
  return <Button slot="close" data-slot="sheet-close" {...props} />
}

function Sheet({
  className,
  children,
  side = 'left',
  isDismissable = true,
  'aria-label': ariaLabel,
  'data-surface': surface,
  ...props
}: Omit<ModalOverlayProps, 'className' | 'children'> &
  Pick<DialogPrimitiveProps, 'aria-label'> & {
    'className'?: string
    'children': ReactNode
    'side'?: 'left' | 'right'
    'data-surface'?: string
  }) {
  return (
    <ModalOverlayPrimitive
      data-slot="sheet-overlay"
      isDismissable={isDismissable}
      className="fixed inset-0 z-50 bg-overlay duration-150 data-entering:animate-in data-entering:fade-in-0 data-exiting:animate-out data-exiting:fade-out-0"
      {...props}
    >
      <ModalPrimitive
        data-slot="sheet-content"
        data-side={side}
        data-surface={surface}
        className={cn(
          'fixed inset-y-0 z-50 flex h-full w-[min(300px,86%)] flex-col overflow-y-auto shadow-2 outline-none duration-200 data-[side=left]:left-0 data-[side=right]:right-0 data-entering:animate-in data-exiting:animate-out data-[side=left]:data-entering:slide-in-from-left data-[side=left]:data-exiting:slide-out-to-left data-[side=right]:data-entering:slide-in-from-right data-[side=right]:data-exiting:slide-out-to-right',
          className
        )}
      >
        <DialogPrimitive
          data-slot="sheet"
          aria-label={ariaLabel}
          className="flex flex-col gap-[inherit] outline-none"
        >
          {children}
        </DialogPrimitive>
      </ModalPrimitive>
    </ModalOverlayPrimitive>
  )
}

function SheetTitle({
  className,
  ...props
}: Omit<ComponentProps<typeof Heading>, 'slot' | 'className'> & { className?: string }) {
  return <Heading slot="title" data-slot="sheet-title" className={className} {...props} />
}

export { Sheet, SheetClose, SheetTitle }
