import {
  createContext,
  useContext,
  useId,
  useLayoutEffect,
  useState,
  type ReactNode,
  type ComponentProps,
} from 'react'
import {
  Dialog as DialogPrimitive,
  DialogTrigger as DialogTriggerPrimitive,
  Heading,
  Modal as ModalPrimitive,
  ModalOverlay as ModalOverlayPrimitive,
  type DialogProps as DialogPrimitiveProps,
  type DialogTriggerProps,
  type ModalOverlayProps,
} from 'react-aria-components'
import { cn } from 'cn'
import { IconX } from '@tabler/icons-react'

import { Button } from '~/components/ui/button'

const DescriptionContext = createContext<{
  id: string
  setPresent: (present: boolean) => void
} | null>(null)

function DialogTrigger(props: DialogTriggerProps) {
  return <DialogTriggerPrimitive {...props} />
}

function DialogClose({
  variant = 'outline',
  ...props
}: Omit<ComponentProps<typeof Button>, 'slot'>) {
  return <Button slot="close" data-slot="dialog-close" variant={variant} {...props} />
}

const CONTENT_VARIANTS = {
  sheet:
    'inset-x-0 bottom-0 max-h-[calc(100dvh-24px)] gap-4.5 rounded-t-xl px-5 pt-2.5 pb-6 max-sm:data-entering:slide-in-from-bottom max-sm:data-exiting:slide-out-to-bottom sm:inset-x-auto sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:w-110 sm:-translate-1/2 sm:rounded-xl sm:data-entering:zoom-in-95 sm:data-exiting:zoom-out-95',
  panel:
    'inset-x-0 bottom-0 max-h-[calc(100dvh-48px)] gap-3.5 rounded-t-xl p-5 max-sm:data-entering:slide-in-from-bottom max-sm:data-exiting:slide-out-to-bottom sm:inset-x-auto sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:max-h-[calc(100dvh-48px)] sm:w-[min(560px,calc(100%-48px))] sm:-translate-1/2 sm:rounded-2xl sm:data-entering:zoom-in-95 sm:data-exiting:zoom-out-95',
  top: 'inset-x-3 top-15 mx-auto max-h-[calc(100dvh-72px)] max-w-130 gap-3.5 rounded-xl p-5 data-entering:zoom-in-95 data-exiting:zoom-out-95',
}

function Dialog({
  className,
  children,
  variant = 'sheet',
  showCloseButton = false,
  isDismissable = true,
  role,
  'aria-label': ariaLabel,
  ...props
}: Omit<ModalOverlayProps, 'className' | 'children'> &
  Pick<DialogPrimitiveProps, 'role' | 'aria-label'> & {
    className?: string
    children: ReactNode
    variant?: keyof typeof CONTENT_VARIANTS
    showCloseButton?: boolean
  }) {
  const descriptionId = useId()
  const [hasDescription, setHasDescription] = useState(false)

  return (
    <ModalOverlayPrimitive
      data-slot="dialog-overlay"
      isDismissable={isDismissable}
      className="fixed inset-0 isolate z-50 bg-overlay duration-150 data-entering:animate-in data-entering:fade-in-0 data-exiting:animate-out data-exiting:fade-out-0"
      {...props}
    >
      <ModalPrimitive
        data-slot="dialog-content"
        data-variant={variant}
        className={cn(
          'fixed z-50 box-border flex flex-col overflow-y-auto bg-popover text-popover-foreground shadow-2 duration-200 outline-none data-entering:animate-in data-entering:fade-in-0 data-exiting:animate-out data-exiting:fade-out-0',
          CONTENT_VARIANTS[variant],
          className
        )}
      >
        <DialogPrimitive
          data-slot="dialog"
          role={role}
          aria-label={ariaLabel}
          aria-describedby={hasDescription ? descriptionId : undefined}
          className="flex flex-col gap-[inherit] outline-none"
        >
          <DescriptionContext value={{ id: descriptionId, setPresent: setHasDescription }}>
            {variant === 'sheet' && (
              <span
                aria-hidden="true"
                className="h-1 w-9 shrink-0 self-center rounded-xs bg-border-strong sm:hidden"
              />
            )}
            {children}
            {showCloseButton && (
              <DialogClose variant="ghost" size="icon" className="absolute top-2 right-2">
                <IconX />
                <span className="sr-only">Tutup</span>
              </DialogClose>
            )}
          </DescriptionContext>
        </DialogPrimitive>
      </ModalPrimitive>
    </ModalOverlayPrimitive>
  )
}

function DialogHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn('flex flex-col gap-1.5 pt-1.5', className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: Omit<ComponentProps<typeof Heading>, 'slot' | 'className'> & { className?: string }) {
  return (
    <Heading
      slot="title"
      data-slot="dialog-title"
      className={cn('font-heading text-[21px] leading-tight font-bold', className)}
      {...props}
    />
  )
}

function DialogDescription({ className, ...props }: ComponentProps<'p'>) {
  const context = useContext(DescriptionContext)
  const setPresent = context?.setPresent

  useLayoutEffect(() => {
    setPresent?.(true)
    return () => setPresent?.(false)
  }, [setPresent])

  return (
    <p
      id={context?.id}
      data-slot="dialog-description"
      className={cn('text-[14.5px] leading-normal text-foreground-secondary', className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
}
