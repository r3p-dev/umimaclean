import { useId, useState } from 'react'
import { IconSend } from '@tabler/icons-react'
import { Button } from '~/components/ui/button'
import { Dialog, DialogClose, DialogDescription } from '~/components/ui/dialog'
import { FieldDescription, FieldError } from '~/components/ui/field'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import DialogTitleBar from '~/components/molecules/dialog_title_bar'
import { DEFAULT_REMINDER } from '~/lib/customers/segments'

export default function ReminderDialog({
  count,
  open,
  onOpenChange,
  onSend,
}: {
  count: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onSend: (message: string) => void
}) {
  const [message, setMessage] = useState(DEFAULT_REMINDER)
  const [error, setError] = useState(false)
  const id = useId()

  return (
    <Dialog isOpen={open} onOpenChange={onOpenChange} variant="panel">
      <DialogTitleBar>Kirim pengingat ke {count} pelanggan</DialogTitleBar>
      <DialogDescription className="text-note leading-normal">
        Dikirim dari WhatsApp bisnis toko. Pelanggan yang menolak pesan promosi otomatis dilewati.
      </DialogDescription>
      <div className="flex min-w-0 flex-col gap-1.5">
        <Label htmlFor={id} className="text-note leading-[1.2]">
          Pesan
        </Label>
        <Textarea
          id={id}
          rows={4}
          value={message}
          aria-invalid={error || undefined}
          aria-describedby={`${id}-note`}
          onChange={(event) => {
            setMessage(event.target.value)
            setError(false)
          }}
          className="resize-y px-3 py-2.5 leading-[1.45]"
        />
        {error ? (
          <FieldError id={`${id}-note`} className="text-meta">
            Tulis pesan pengingat terlebih dulu.
          </FieldError>
        ) : (
          <FieldDescription id={`${id}-note`} className="text-caption">
            {'{nama}'} diganti otomatis dengan nama pelanggan.
          </FieldDescription>
        )}
      </div>
      <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row sm:items-center">
        <DialogClose variant="outline" size="desktop">
          Batal
        </DialogClose>
        <Button
          size="desktop"
          onPress={() => {
            if (!message.trim()) {
              setError(true)
              return
            }
            onSend(message)
          }}
        >
          <IconSend className="size-4.5" />
          Kirim pengingat
        </Button>
      </div>
    </Dialog>
  )
}
