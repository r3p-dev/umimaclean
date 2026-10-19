import { Toaster as Sonner, type ToasterProps } from 'sonner'
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCircleCheckFilled,
  IconInfoCircle,
  IconLoader2,
} from '@tabler/icons-react'

function Toaster({ toastOptions, ...props }: ToasterProps) {
  return (
    <Sonner
      position="bottom-center"
      duration={5000}
      icons={{
        success: <IconCircleCheckFilled className="size-5 text-success-on-inverse" />,
        info: <IconInfoCircle className="size-5 text-ring-inverse" />,
        warning: <IconAlertTriangle className="size-5 text-attention-solid" />,
        error: <IconAlertCircle className="size-5 text-destructive-on-inverse" />,
        loading: <IconLoader2 className="size-5 animate-spin" />,
      }}
      toastOptions={{
        unstyled: true,
        ...toastOptions,
        classNames: {
          toast:
            'flex w-full items-center gap-2.5 rounded-md bg-surface-inverse py-2.5 pr-2.5 pl-3.5 font-sans text-sm leading-[1.4] font-medium text-surface-inverse-foreground shadow-1',
          icon: 'flex shrink-0',
          content: 'flex min-w-0 flex-1 flex-col gap-0.5',
          description: 'font-normal text-surface-inverse-muted',
          actionButton:
            'ml-auto h-btn-compact shrink-0 rounded-inner px-3 font-semibold text-ring-inverse hover:bg-white/10',
          cancelButton:
            'h-btn-compact shrink-0 rounded-inner px-3 font-semibold text-surface-inverse-muted hover:bg-white/10',
          ...toastOptions?.classNames,
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
