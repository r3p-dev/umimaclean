import { useId, useState } from 'react'
import { Button } from '~/components/ui/button'
import { Dialog, DialogClose, DialogDescription } from '~/components/ui/dialog'
import { FieldError } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import ChoicePills from '~/components/molecules/choice_pills'
import DialogTitleBar from '~/components/molecules/dialog_title_bar'
import { COST_CATEGORIES, type Cost, type CostCategory } from '~/lib/reports/costs'

const FOOTER = 'flex flex-col-reverse justify-end gap-2 sm:flex-row sm:items-center'

export function CostFormDialog({
  isOpen,
  onOpenChange,
  initial,
  isEditing,
  onSave,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  initial: Omit<Cost, 'id'>
  isEditing: boolean
  onSave: (cost: Omit<Cost, 'id'>) => void
}) {
  const [category, setCategory] = useState<CostCategory>(initial.category)
  const [amount, setAmount] = useState(initial.amount ? String(initial.amount) : '')
  const [note, setNote] = useState(initial.note)
  const [date, setDate] = useState(initial.date)
  const [hasError, setError] = useState(false)
  const categoryId = useId()
  const amountId = useId()
  const noteId = useId()
  const dateId = useId()

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} variant="panel">
      <DialogTitleBar>{isEditing ? 'Ubah biaya' : 'Tambah biaya operasional'}</DialogTitleBar>
      <div className="flex flex-col gap-1.5">
        <span id={categoryId} className="text-note leading-[1.2] font-semibold">
          Kategori
        </span>
        <ChoicePills
          labelledBy={categoryId}
          value={category}
          onChange={setCategory}
          options={COST_CATEGORIES.map((item) => ({ value: item, label: item }))}
        />
      </div>
      <div className="flex min-w-0 flex-col gap-1.5">
        <Label htmlFor={amountId} className="text-note leading-[1.2]">
          Jumlah (Rp)
        </Label>
        <Input
          id={amountId}
          inputMode="numeric"
          autoComplete="off"
          placeholder="2500000"
          value={amount}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? `${amountId}-error` : undefined}
          onChange={(event) => {
            setAmount(event.target.value.replace(/\D/g, '').slice(0, 10))
            setError(false)
          }}
          className="px-3"
        />
        {hasError && (
          <FieldError id={`${amountId}-error`} className="text-meta">
            Isi jumlah biaya.
          </FieldError>
        )}
      </div>
      <div className="flex min-w-0 flex-col gap-1.5">
        <Label htmlFor={noteId} className="text-note leading-[1.2]">
          Keterangan
        </Label>
        <Input
          id={noteId}
          autoComplete="off"
          placeholder="mis. sewa ruko Oktober"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="px-3"
        />
      </div>
      <div className="flex min-w-0 flex-col gap-1.5">
        <Label htmlFor={dateId} className="text-note leading-[1.2]">
          Tanggal
        </Label>
        <Input
          id={dateId}
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="px-3"
        />
      </div>
      <div className={FOOTER}>
        <DialogClose variant="outline" size="desktop">
          Batal
        </DialogClose>
        <Button
          size="desktop"
          onPress={() => {
            if (!(Number(amount) > 0)) {
              setError(true)
              return
            }
            onSave({
              category,
              amount: Number(amount),
              note: note.trim() || category,
              date: date || initial.date,
            })
          }}
        >
          {isEditing ? 'Simpan' : 'Tambah biaya'}
        </Button>
      </div>
    </Dialog>
  )
}

export function DeleteCostDialog({
  isOpen,
  onOpenChange,
  name,
  onDelete,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  name: string
  onDelete: () => void
}) {
  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} variant="panel">
      <DialogTitleBar>Hapus biaya “{name}”?</DialogTitleBar>
      <DialogDescription className="text-note leading-normal">
        Laba bersih dihitung ulang setelah biaya dihapus. Perubahan tercatat di Aktivitas Staf.
      </DialogDescription>
      <div className={FOOTER}>
        <DialogClose variant="outline" size="desktop">
          Batal
        </DialogClose>
        <Button variant="destructive" size="desktop" onPress={onDelete}>
          Hapus biaya
        </Button>
      </div>
    </Dialog>
  )
}
