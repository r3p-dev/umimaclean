import type { ReactNode } from 'react'
import {
  SwitchField as SwitchFieldPrimitive,
  SwitchButton as SwitchButtonPrimitive,
  type SwitchFieldProps,
} from 'react-aria-components'
import { cn } from 'cn'

export interface SwitchProps extends Omit<SwitchFieldProps, 'children'> {
  children?: ReactNode
  size?: 'sm' | 'default'
  buttonClassName?: string
}

function Switch({ className, buttonClassName, size = 'default', children, ...props }: SwitchProps) {
  return (
    <SwitchFieldPrimitive
      data-slot="switch-field"
      className={cn('inline-flex items-center', className)}
      {...props}
    >
      <SwitchButtonPrimitive
        data-slot="switch-button"
        data-size={size}
        className={cn(
          'peer group/switch relative inline-flex shrink-0 cursor-pointer items-center rounded-full border border-transparent shadow-xs transition-all outline-none not-data-selected:bg-input group-has-focus-visible/field-label:border-transparent group-has-focus-visible/field-label:ring-0 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-focus-visible:border-ring data-focus-visible:ring-3 data-focus-visible:ring-ring/50 data-invalid:border-destructive data-invalid:ring-3 data-invalid:ring-destructive/20 data-[size=default]:h-[18.4px] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 data-checked:bg-primary data-unchecked:bg-input data-selected:bg-primary data-disabled:cursor-not-allowed data-disabled:opacity-50',
          buttonClassName
        )}
      >
        {({ isSelected }) => (
          <>
            <span
              data-slot="switch-thumb"
              data-selected={isSelected || undefined}
              className="pointer-events-none block rounded-full bg-background ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=default]/switch:not-data-selected:translate-x-0 group-data-[size=sm]/switch:size-3 group-data-[size=sm]/switch:not-data-selected:translate-x-0 group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0 group-data-[size=default]/switch:data-selected:translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:data-selected:translate-x-[calc(100%-2px)]"
            />
            {children}
          </>
        )}
      </SwitchButtonPrimitive>
    </SwitchFieldPrimitive>
  )
}

export { Switch }
