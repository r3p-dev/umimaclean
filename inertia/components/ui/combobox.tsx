import type { ComponentProps, ReactNode, RefObject } from 'react'
import { cn } from 'cn'
import {
  ComboBox as ComboBoxPrimitive,
  composeRenderProps,
  ListBoxItem as ListBoxItemPrimitive,
  ListBox as ListBoxPrimitive,
  Popover as PopoverPrimitive,
  type ListBoxItemProps,
  type ListBoxProps,
} from 'react-aria-components'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '~/components/ui/input_group'
import { IconCheck, IconChevronDown } from '@tabler/icons-react'

function ComboboxInput({
  className,
  children,
  disabled = false,
  showTrigger = true,
  ...props
}: ComponentProps<'input'> & {
  showTrigger?: boolean
}) {
  return (
    <InputGroup className={cn('w-auto', className)}>
      <InputGroupInput disabled={disabled} {...props} />
      <InputGroupAddon align="inline-end">
        {showTrigger && (
          <InputGroupButton
            size="icon-xs"
            variant="ghost"
            data-slot="combobox-trigger"
            className="group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent [&_svg:not([class*='size-'])]:size-4"
            isDisabled={disabled}
          >
            <IconChevronDown className="pointer-events-none size-4 text-muted-foreground" />
          </InputGroupButton>
        )}
      </InputGroupAddon>
      {children}
    </InputGroup>
  )
}

function ComboboxContent({
  className,
  placement = 'bottom',
  offset = 6,
  crossOffset = 0,
  anchor,
  ...props
}: Omit<ComponentProps<typeof PopoverPrimitive>, 'className' | 'children'> & {
  className?: string
  children?: ReactNode
  anchor?: RefObject<HTMLDivElement | null>
}) {
  return (
    <PopoverPrimitive
      data-slot="combobox-content"
      placement={placement}
      offset={offset}
      crossOffset={crossOffset}
      triggerRef={anchor}
      className={cn(
        'relative isolate z-50 max-h-72 w-(--trigger-width) min-w-36 origin-(--trigger-anchor-point) overflow-hidden rounded-md bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-entering:animate-in data-entering:fade-in-0 data-entering:zoom-in-95 data-exiting:animate-out data-exiting:fade-out-0 data-exiting:zoom-out-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2 **:data-[slot$=-item]:data-focused:bg-foreground/10 *:data-[slot=input-group]:m-1 *:data-[slot=input-group]:mb-0 *:data-[slot=input-group]:h-8 *:data-[slot=input-group]:border-input/30 *:data-[slot=input-group]:bg-input/30 *:data-[slot=input-group]:shadow-none',
        className
      )}
      {...props}
    />
  )
}

function ComboboxList<T extends object>({ className, ...props }: ListBoxProps<T>) {
  return (
    <ListBoxPrimitive
      data-slot="combobox-list"
      className={cn(
        'group/combobox-content no-scrollbar max-h-[inherit] scroll-py-1 overflow-y-auto overscroll-contain p-1 data-empty:p-0',
        className
      )}
      {...props}
    />
  )
}

function ComboboxItem<T extends object>({ className, children, ...props }: ListBoxItemProps<T>) {
  return (
    <ListBoxItemPrimitive
      data-slot="combobox-item"
      textValue={typeof children === 'string' ? children : undefined}
      className={cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-focused:bg-accent data-focused:text-accent-foreground not-data-[variant=destructive]:data-focused:**:text-accent-foreground data-highlighted:bg-accent data-highlighted:text-accent-foreground not-data-[variant=destructive]:data-highlighted:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {composeRenderProps(children, (content, { isSelected }) => (
        <>
          {content}
          <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
            {isSelected ? <IconCheck className="pointer-events-none" /> : null}
          </span>
        </>
      ))}
    </ListBoxItemPrimitive>
  )
}

function ComboboxEmpty({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="combobox-empty"
      className={cn(
        'hidden w-full justify-center py-2 text-center text-sm text-muted-foreground group-data-empty/combobox-content:flex',
        className
      )}
      {...props}
    />
  )
}

export {
  ComboBoxPrimitive as Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
}
