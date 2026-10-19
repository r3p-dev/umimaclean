import {
  composeRenderProps,
  SwitchButton,
  SwitchField,
  type SwitchButtonProps,
  type SwitchFieldProps,
} from 'react-aria-components'
import { cn } from 'cn'

type SwitchProps = Omit<SwitchFieldProps, 'children'> & {
  className?: string
  buttonClassName?: string
  trackClassName?: string
  thumbClassName?: string
  children?: SwitchButtonProps['children']
}

function Switch({
  className,
  buttonClassName,
  trackClassName,
  thumbClassName,
  children,
  ...props
}: SwitchProps) {
  return (
    <SwitchField data-slot="switch" className={className} {...props}>
      <SwitchButton
        className={cn(
          'group/switch inline-flex shrink-0 items-center data-disabled:cursor-not-allowed',
          buttonClassName
        )}
      >
        {composeRenderProps(children, (content) => (
          <>
            <span
              data-slot="switch-track"
              className={cn(
                'hit-area inline-flex h-7 w-11.5 shrink-0 cursor-pointer items-center rounded-pill bg-input p-0.75 transition-colors duration-120',
                'group-data-disabled/switch:cursor-not-allowed group-data-disabled/switch:bg-disabled',
                'group-data-focus-visible/switch:focus-ring',
                'group-data-selected/switch:bg-primary',
                trackClassName
              )}
            >
              <span
                data-slot="switch-thumb"
                className={cn(
                  'pointer-events-none block size-5.5 rounded-full bg-card shadow-xs transition-transform duration-120',
                  'group-data-selected/switch:translate-x-4.5',
                  thumbClassName
                )}
              />
            </span>
            {content}
          </>
        ))}
      </SwitchButton>
    </SwitchField>
  )
}

export { Switch }
