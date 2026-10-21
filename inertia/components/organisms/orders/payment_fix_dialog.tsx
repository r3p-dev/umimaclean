import { useId, useState } from 'react'
import { Button } from '~/components/ui/button'
import { Dialog, DialogClose, DialogDescription } from '~/components/ui/dialog'
import { FieldError } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import ChoicePills from '~/components/molecules/choice_pills'
import DialogTitleBar from '~/components/molecules/dialog_title_bar'
import { FIX_METHODS, type FixMethod, type PaymentFix } from '~/lib/orders/admin_orders'

export default function PaymentFixDialog({
  isOpen,
  onOpenChange,
  defaultAmount,
  isSaving = false,
  onSave,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  defaultAmount: number
  isSaving?: boolean
  onSave: (fix: PaymentFix) => void
}) {
  const [method, setMethod] = useState<FixMethod>('cash')
  const [amount, setAmount] = useState(defaultAmount ? String(defaultAmount) : '')
  const [reason, setReason] = useState('')
  const [errors, setErrors] = useState<{ amount?: string; reason?: string }>({})
  const amountId = useId()
  const reasonId = useId()
  const methodId = useId()

  function save() {
    const found: typeof errors = {}
    if (!(Number(amount) > 0)) {
      found.amount = 'Isi jumlah yang diterima.'
    }
    if (!reason.trim()) {
      found.reason = 'Alasan wajib diisi.'
    }
    setErrors(found)
    if (Object.keys(found).length) {
      return
    }
    onSave({ method, amount: Number(amount), reason: reason.trim() })
  }

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} variant="panel">
      <DialogTitleBar>Koreksi pembayaran</DialogTitleBar>
      <DialogDescription className="text-note leading-normal">
        Dipakai bila pembayaran tercatat salah (mis. dibayar di toko tapi belum tercatat). Koreksi
        tercatat sebagai aksi sensitif.
      </DialogDescription>
      <div className="flex flex-col gap-1.5">
        <span id={methodId} className="text-note leading-[1.2] font-semibold">
          Metode
        </span>
        <ChoicePills
          labelledBy={methodId}
          value={method}
          onChange={setMethod}
          options={FIX_METHODS}
        />
      </div>
      <div className="flex min-w-0 flex-col gap-1.5">
        <Label htmlFor={amountId} className="text-note leading-[1.2]">
          Jumlah diterima (Rp)
        </Label>
        <Input
          id={amountId}
          inputMode="numeric"
          autoComplete="off"
          placeholder="195000"
          value={amount}
          aria-invalid={errors.amount ? true : undefined}
          aria-describedby={errors.amount ? `${amountId}-error` : undefined}
          onChange={(event) => setAmount(event.target.value.replace(/\D/g, '').slice(0, 9))}
          className="px-3"
        />
        {errors.amount && (
          <FieldError id={`${amountId}-error`} className="text-meta">
            {errors.amount}
          </FieldError>
        )}
      </div>
      <div className="flex min-w-0 flex-col gap-1.5">
        <Label htmlFor={reasonId} className="text-note leading-[1.2]">
          Alasan koreksi (wajib)
        </Label>
        <Input
          id={reasonId}
          autoComplete="off"
          placeholder="mis. pelanggan bayar tunai di toko"
          value={reason}
          aria-invalid={errors.reason ? true : undefined}
          aria-describedby={errors.reason ? `${reasonId}-error` : undefined}
          onChange={(event) => setReason(event.target.value)}
          className="px-3"
        />
        {errors.reason && (
          <FieldError id={`${reasonId}-error`} className="text-meta">
            {errors.reason}
          </FieldError>
        )}
      </div>
      <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row sm:items-center">
        <DialogClose variant="outline" size="desktop">
          Batal
        </DialogClose>
        <Button size="desktop" onPress={save} isPending={isSaving}>
          Simpan koreksi
        </Button>
      </div>
    </Dialog>
  )
}
