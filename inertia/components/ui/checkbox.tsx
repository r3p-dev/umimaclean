import {
  CheckboxButton,
  CheckboxField,
  composeRenderProps,
  type CheckboxButtonProps,
  type CheckboxFieldProps,
} from 'react-aria-components'
import { cn } from 'cn'

type MarkState = boolean | 'indeterminate'

type CheckboxProps = Omit<CheckboxFieldProps, 'children'> & {
  className?: string
  buttonClassName?: string
  indicatorClassName?: string
  children?: CheckboxButtonProps['children']
}

function CheckboxMark({ checked, className }: { checked: MarkState; className?: string }) {
  return (
    <span
      aria-hidden="true"
      data-state={checked === 'indeterminate' ? 'indeterminate' : checked ? 'checked' : 'unchecked'}
      className={cn(
        'relative inline-block size-5 shrink-0 rounded-xs border-2 border-input bg-card transition-[background-color,border-color,box-shadow] duration-120',
        'data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary',
        'data-[state=checked]:after:absolute data-[state=checked]:after:top-px data-[state=checked]:after:left-1.25 data-[state=checked]:after:h-2.5 data-[state=checked]:after:w-1.25 data-[state=checked]:after:rotate-45 data-[state=checked]:after:border-r-[2.5px] data-[state=checked]:after:border-b-[2.5px] data-[state=checked]:after:border-primary-foreground data-[state=checked]:after:content-[""]',
        'data-[state=indeterminate]:after:absolute data-[state=indeterminate]:after:inset-x-0.75 data-[state=indeterminate]:after:top-1/2 data-[state=indeterminate]:after:mt-[-1.25px] data-[state=indeterminate]:after:h-[2.5px] data-[state=indeterminate]:after:rounded-[1px] data-[state=indeterminate]:after:bg-primary-foreground data-[state=indeterminate]:after:content-[""]',
        'group-[:hover:not([data-disabled])]/check:border-primary group-[:hover:not([data-disabled])]/check:shadow-[0_0_0_4px_var(--accent-strong)]',
        'group-data-disabled/check:border-border-strong group-data-disabled/check:bg-disabled',
        className
      )}
    />
  )
}

function Checkbox({
  className,
  buttonClassName,
  indicatorClassName,
  children,
  ...props
}: CheckboxProps) {
  return (
    <CheckboxField data-slot="checkbox" className={className} {...props}>
      <CheckboxButton
        className={cn(
          'group/check inline-flex size-icon-btn shrink-0 cursor-pointer items-center justify-center rounded-md align-middle data-disabled:cursor-not-allowed data-focus-visible:focus-ring',
          buttonClassName
        )}
      >
        {composeRenderProps(children, (content, { isSelected, isIndeterminate }) => (
          <>
            <CheckboxMark
              checked={isIndeterminate ? 'indeterminate' : isSelected}
              className={indicatorClassName}
            />
            {content}
          </>
        ))}
      </CheckboxButton>
    </CheckboxField>
  )
}

export { Checkbox, CheckboxMark }
