import { useId, useState } from 'react'
import { IconInfoCircle } from '@tabler/icons-react'
import { Button } from '~/components/ui/button'
import { Dialog, DialogClose, DialogDescription, DialogTitle } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import ChoiceRow from '~/components/molecules/choice_row'

export default function SkipTaskDialog({
  isOpen,
  onOpenChange,
  noun,
  reasons,
  isPending = false,
  onSkip,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  noun: string
  reasons: string[]
  isPending?: boolean
  onSkip: (reason: number, note: string) => void
}) {
  const [reason, setReason] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const noteId = useId()

  function change(isNextOpen: boolean) {
    if (isNextOpen) {
      setReason(null)
      setNote('')
    }
    onOpenChange(isNextOpen)
  }

  return (
    <Dialog isOpen={isOpen} onOpenChange={change} variant="top">
      <div>
        <DialogTitle className="text-[19px] leading-[1.3] font-bold">
          Lewati {noun.toLowerCase()} ini?
        </DialogTitle>
        <DialogDescription className="mt-1 text-sm leading-[1.45]">
          Alasan dicatat bersama waktu dan nama Anda. Pesanan kembali ke antrean untuk dijadwalkan
          ulang.
        </DialogDescription>
      </div>
      <p className="flex gap-2 rounded-md bg-attention px-3 py-2.5 text-meta leading-[1.45] text-attention-foreground">
        <IconInfoCircle className="mt-0.5 size-4.25 shrink-0" />
        Pelanggan tidak merespons? Telepon dan kirim pesan dulu. Lewati bila ±15 menit tetap tidak
        ada jawaban.
      </p>
      <div role="radiogroup" aria-label="Alasan" className="flex flex-col gap-1.5">
        {reasons.map((label, index) => (
          <ChoiceRow
            key={label}
            role="radio"
            tone="destructive"
            isChecked={reason === index}
            onChange={() => setReason(index)}
            className="min-h-11.5 px-3"
          >
            {label}
          </ChoiceRow>
        ))}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={noteId} className="text-note">
          Catatan tambahan
        </Label>
        <Input
          id={noteId}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Opsional, mis. sudah ditelepon 3 kali"
        />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <DialogClose variant="outline" size="cta" className="text-[15px]">
          Batal
        </DialogClose>
        <Button
          variant="destructive"
          size="cta"
          isDisabled={reason === null}
          isPending={isPending}
          onPress={() => reason !== null && onSkip(reason, note)}
          className="text-[15px]"
        >
          Lewati {noun}
        </Button>
      </div>
    </Dialog>
  )
}
