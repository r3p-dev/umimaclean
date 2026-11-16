import type { ReactNode } from 'react'
import {
  CheckboxField as CheckboxFieldPrimitive,
  CheckboxButton as CheckboxButtonPrimitive,
  type CheckboxFieldProps,
} from 'react-aria-components'
import { IconCheck } from '@tabler/icons-react'
import { cn } from 'cn'

export interface CheckboxProps extends Omit<CheckboxFieldProps, 'children'> {
  children?: ReactNode
  labelClassName?: string
  buttonClassName?: string
}

function Checkbox({
  className,
  buttonClassName,
  labelClassName,
  children,
  ...props
}: CheckboxProps) {
  return (
    <CheckboxFieldPrimitive
      data-slot="checkbox-field"
      className={cn('inline-flex items-center', className)}
      {...props}
    >
      <CheckboxButtonPrimitive
        data-slot="checkbox-button"
        className={cn(
          'group/checkbox-button flex min-h-11 cursor-pointer items-center gap-3 select-none outline-none focus-visible:outline-none',
          buttonClassName
        )}
      >
        {({ isSelected, isIndeterminate }) => (
          <>
            <span
              data-slot="checkbox"
              className={cn(
                'relative flex size-4 shrink-0 items-center justify-center rounded-lg border border-input shadow-xs transition-shadow outline-none',
                'group-data-focus-visible/checkbox-button:border-ring group-data-focus-visible/checkbox-button:ring-3 group-data-focus-visible/checkbox-button:ring-ring/50',
                'group-data-invalid/checkbox-button:border-destructive group-data-invalid/checkbox-button:ring-3 group-data-invalid/checkbox-button:ring-destructive/20',
                'group-data-disabled/checkbox-button:cursor-not-allowed group-data-disabled/checkbox-button:opacity-50',
                (isSelected || isIndeterminate) &&
                  'border-primary bg-primary text-primary-foreground'
              )}
            >
              {(isSelected || isIndeterminate) && <IconCheck className="size-3.5 stroke-[2.5]" />}
            </span>
            {children && (
              <span className={cn('text-base font-normal text-foreground', labelClassName)}>
                {children}
              </span>
            )}
          </>
        )}
      </CheckboxButtonPrimitive>
    </CheckboxFieldPrimitive>
  )
}

export {
  Checkbox,
  CheckboxFieldPrimitive as CheckboxField,
  CheckboxButtonPrimitive as CheckboxButton,
}
