import type { ReactNode, ComponentProps } from 'react'
import {
  Menu as MenuPrimitive,
  MenuItem as MenuItemPrimitive,
  MenuTrigger as MenuTriggerPrimitive,
  Popover as PopoverPrimitive,
  type MenuItemProps as MenuItemPrimitiveProps,
  type MenuProps as MenuPrimitiveProps,
  type PopoverProps as PopoverPrimitiveProps,
} from 'react-aria-components'
import { cn } from 'cn'

function DropdownMenuTrigger(props: ComponentProps<typeof MenuTriggerPrimitive>) {
  return <MenuTriggerPrimitive {...props} />
}

function DropdownMenu({
  className,
  children,
  placement = 'bottom end',
  offset = 6,
  ...props
}: Omit<MenuPrimitiveProps<object>, 'className' | 'children'> &
  Pick<PopoverPrimitiveProps, 'placement' | 'offset'> & {
    className?: string
    children: ReactNode
  }) {
  return (
    <PopoverPrimitive
      data-slot="dropdown-menu-content"
      placement={placement}
      offset={offset}
      containerPadding={12}
      className={cn(
        'z-50 flex min-w-59 origin-(--trigger-anchor-point) flex-col overflow-y-auto rounded-lg border border-border bg-popover p-1.5 text-popover-foreground shadow-1 duration-100 data-entering:animate-in data-entering:fade-in-0 data-entering:zoom-in-95 data-exiting:animate-out data-exiting:fade-out-0 data-exiting:zoom-out-95',
        className
      )}
    >
      <MenuPrimitive className="flex flex-col outline-hidden" {...props}>
        {children}
      </MenuPrimitive>
    </PopoverPrimitive>
  )
}

function DropdownMenuItem({
  className,
  variant = 'default',
  children,
  textValue,
  ...props
}: Omit<MenuItemPrimitiveProps<object>, 'className' | 'children'> & {
  className?: string
  children: ReactNode
  variant?: 'default' | 'destructive'
}) {
  return (
    <MenuItemPrimitive
      data-slot="dropdown-menu-item"
      data-variant={variant}
      textValue={textValue ?? (typeof children === 'string' ? children : undefined)}
      className={cn(
        'flex min-h-btn-desktop cursor-pointer items-center gap-2.5 rounded-md px-3 text-[14.5px] leading-none font-medium text-foreground no-underline outline-hidden select-none hover:no-underline data-focused:bg-accent data-[variant=destructive]:font-semibold data-[variant=destructive]:text-destructive-text data-disabled:pointer-events-none data-disabled:text-disabled-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-5',
        className
      )}
      {...props}
    >
      {children}
    </MenuItemPrimitive>
  )
}

export { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger }
