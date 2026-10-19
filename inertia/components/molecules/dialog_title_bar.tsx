import { type ReactNode } from 'react'
import { IconX } from '@tabler/icons-react'
import { DialogClose, DialogTitle } from '~/components/ui/dialog'

export default function DialogTitleBar({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <DialogTitle className="flex-1 text-[19px] leading-tight font-bold">{children}</DialogTitle>
      <DialogClose
        variant="ghost"
        size="icon"
        aria-label="Tutup"
        className="text-foreground-secondary"
      >
        <IconX className="size-5.5" />
      </DialogClose>
    </div>
  )
}
