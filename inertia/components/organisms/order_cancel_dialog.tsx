import { useState, type SyntheticEvent } from 'react'
import { router, usePage } from '@inertiajs/react'
import { urlFor } from '~/client'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '~/components/ui/field'
import { Textarea } from '~/components/ui/textarea'

const PRESET_REASONS = [
  'Salah jadwal penjemputan',
  'Barang batal dicuci',
  'Ingin antar sendiri ke toko',
]

export default function OrderCancelDialog({
  orderId,
  orderNumber,
  isOpen,
  onOpenChange,
}: {
  orderId: number
  orderNumber: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}) {
  const serverErrors = usePage().props.errors
  const [reason, setReason] = useState('')
  const [isSubmitting, setSubmitting] = useState(false)

  function handleSubmit(event: SyntheticEvent) {
    event.preventDefault()
    setSubmitting(true)
    router.post(
      urlFor('customer.orders.cancel', { id: orderId }),
      { reason },
      {
        preserveScroll: true,
        onFinish: () => setSubmitting(false),
        onSuccess: () => {
          setReason('')
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold">Batalkan pesanan {orderNumber}?</DialogTitle>
        <DialogDescription>
          Pesanan bisa dibatalkan selama kurir belum berangkat menjemput.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {PRESET_REASONS.map((preset) => (
            <Button
              key={preset}
              type="button"
              variant={reason === preset ? 'default' : 'outline'}
              size="sm"
              className="min-h-11 rounded-full px-3 text-xs"
              onPress={() => setReason(preset)}
            >
              {preset}
            </Button>
          ))}
        </div>
        <Field>
          <FieldLabel htmlFor="cancel-reason">Alasan pembatalan</FieldLabel>
          <Textarea
            id="cancel-reason"
            name="reason"
            rows={3}
            maxLength={200}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Tulis alasan pembatalan (3–200 karakter)"
            className="text-base"
          />
          {serverErrors?.reason && <FieldError>{serverErrors.reason}</FieldError>}
        </Field>
        <DialogFooter>
          <DialogClose variant="outline" className="min-h-11">
            Kembali
          </DialogClose>
          <Button
            type="submit"
            variant="destructive"
            className="min-h-11"
            isDisabled={isSubmitting}
          >
            Batalkan Pesanan
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
