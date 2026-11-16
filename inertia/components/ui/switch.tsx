import type { ReactNode } from 'react'
import {
  SwitchField as SwitchFieldPrimitive,
  SwitchButton as SwitchButtonPrimitive,
  type SwitchFieldProps,
} from 'react-aria-components'
import { cn } from 'cn'

export interface SwitchProps extends Omit<SwitchFieldProps, 'children'> {
  children?: ReactNode
  labelClassName?: string
  buttonClassName?: string
}

function Switch({ className, buttonClassName, labelClassName, children, ...props }: SwitchProps) {
  return (
    <SwitchFieldPrimitive
      data-slot="switch-field"
      className={cn('inline-flex items-center gap-2.5', className)}
      {...props}
    >
      <SwitchButtonPrimitive
        data-slot="switch-button"
        className={cn(
          'group/switch-button inline-flex min-h-11 cursor-pointer items-center gap-2.5 select-none outline-none focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          buttonClassName
        )}
      >
        {({ isSelected }) => (
          <>
            <span
              data-slot="switch-track"
              className={cn(
                'inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent transition-colors duration-200',
                'group-data-focus-visible/switch-button:border-ring group-data-focus-visible/switch-button:ring-3 group-data-focus-visible/switch-button:ring-ring/50',
                isSelected ? 'bg-primary' : 'bg-input'
              )}
            >
              <span
                data-slot="switch-thumb"
                className={cn(
                  'pointer-events-none block size-5 rounded-full bg-background shadow-xs ring-0 transition-transform duration-200',
                  isSelected ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </span>
            {children && (
              <span className={cn('text-sm font-medium text-foreground', labelClassName)}>
                {children}
              </span>
            )}
          </>
        )}
      </SwitchButtonPrimitive>
    </SwitchFieldPrimitive>
  )
}

export { Switch, SwitchFieldPrimitive as SwitchField, SwitchButtonPrimitive as SwitchButton }
