import { useId, useState } from 'react'
import { Button } from '~/components/ui/button'
import { Dialog, DialogClose, DialogDescription } from '~/components/ui/dialog'
import { FieldError } from '~/components/ui/field'
import ChoicePills from '~/components/molecules/choice_pills'
import DialogTitleBar from '~/components/molecules/dialog_title_bar'
import { PHASE_FILTERS, PHASE_LABEL, statusNote, type AdminOrder } from '~/lib/orders/admin_orders'
import type { StatusTone } from '~/lib/tracking/status'

const FOOTER = 'flex flex-col-reverse justify-end gap-2 sm:flex-row sm:items-center'

export function StatusDialog({
  isOpen,
  onOpenChange,
  selected,
  onApply,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selected: AdminOrder[]
  onApply: (target: StatusTone) => string | null
}) {
  const [target, setTarget] = useState<StatusTone | null>(null)
  const [error, setError] = useState<string | null>(null)
  const labelId = useId()

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      variant="panel"
      aria-describedby={`${labelId}-note`}
    >
      <DialogTitleBar>Ubah status {selected.length} pesanan</DialogTitleBar>
      <div className="flex flex-col gap-1.5">
        <span id={labelId} className="text-note leading-[1.2] font-semibold">
          Status tujuan
        </span>
        <ChoicePills
          labelledBy={labelId}
          value={target}
          onChange={(value) => {
            setTarget(value)
            setError(null)
          }}
          options={PHASE_FILTERS.filter((phase) => phase !== 'batal').map((phase) => ({
            value: phase,
            label: PHASE_LABEL[phase],
          }))}
        />
      </div>
      <p
        id={`${labelId}-note`}
        role="status"
        className="rounded-md bg-muted px-3 py-2.5 text-note leading-normal text-foreground"
      >
        {statusNote(selected, target)}
      </p>
      {error && <FieldError className="text-meta">{error}</FieldError>}
      <div className={FOOTER}>
        <DialogClose variant="outline" size="desktop">
          Batal
        </DialogClose>
        <Button
          size="desktop"
          onPress={() => {
            if (!target) {
              setError('Pilih status tujuan terlebih dulu.')
              return
            }
            setError(onApply(target))
          }}
        >
          Ubah status
        </Button>
      </div>
    </Dialog>
  )
}

export function CancelDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  reasons,
  skipped,
  confirmLabel,
  backLabel = 'Kembali',
  onConfirm,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  reasons: string[]
  skipped?: string
  confirmLabel: string
  backLabel?: string
  onConfirm: (reason: string) => void
}) {
  const [reason, setReason] = useState<string | null>(null)
  const [hasError, setError] = useState(false)
  const labelId = useId()

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} variant="panel">
      <DialogTitleBar>{title}</DialogTitleBar>
      <DialogDescription className="text-note leading-normal">{description}</DialogDescription>
      {skipped && (
        <p className="rounded-md bg-attention px-3 py-2.5 text-note leading-[1.45] font-medium text-attention-foreground">
          {skipped}
        </p>
      )}
      <div className="flex flex-col gap-1.5">
        <span id={labelId} className="text-note leading-[1.2] font-semibold">
          Alasan (wajib)
        </span>
        <ChoicePills
          labelledBy={labelId}
          value={reason}
          onChange={(value) => {
            setReason(value)
            setError(false)
          }}
          options={reasons.map((item) => ({ value: item, label: item }))}
        />
      </div>
      {hasError && <FieldError className="text-meta">Pilih alasan pembatalan.</FieldError>}
      <div className={FOOTER}>
        <DialogClose variant="outline" size="desktop">
          {backLabel}
        </DialogClose>
        <Button
          variant="destructive"
          size="desktop"
          onPress={() => {
            if (!reason) {
              setError(true)
              return
            }
            onConfirm(reason)
          }}
        >
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  )
}
