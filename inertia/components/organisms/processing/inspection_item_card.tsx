import { useId } from 'react'
import { IconAlertCircle, IconTrash } from '@tabler/icons-react'
import MediaPlaceholder from '~/components/atoms/media_placeholder'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import ChoiceRow from '~/components/molecules/choice_row'
import type { CategoryCatalog, Selection, ServiceOption } from '~/lib/processing/catalog'
import { formatRupiah } from '~/lib/shared/format'
import { cn } from '~/lib/shared/utils'

function OptionGroup({
  role,
  title,
  hint,
  options,
  isOn,
  onPick,
  isLocked,
}: {
  role: 'radio' | 'checkbox'
  title: string
  hint: string
  options: ServiceOption[]
  isOn: (id: number) => boolean
  onPick: (id: number) => void
  isLocked: boolean
}) {
  const labelId = useId()

  return (
    <div
      role={role === 'radio' ? 'radiogroup' : 'group'}
      aria-labelledby={labelId}
      className="flex flex-col gap-2"
    >
      <span
        id={labelId}
        className="text-meta leading-[1.3] font-semibold text-foreground-secondary"
      >
        {title} <span className="font-normal text-muted-foreground">· {hint}</span>
      </span>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.length === 0 && (
          <span className="text-meta text-muted-foreground">Belum ada layanan aktif.</span>
        )}
        {options.map((option) => (
          <ChoiceRow
            key={option.id}
            role={role}
            isChecked={isOn(option.id)}
            isDisabled={isLocked}
            onChange={() => onPick(option.id)}
            className="min-h-12"
          >
            <span className="flex-1">{option.name}</span>
            <span className="font-semibold">{formatRupiah(option.price)}</span>
          </ChoiceRow>
        ))}
      </div>
    </div>
  )
}

export default function InspectionItemCard({
  label,
  title,
  category,
  note,
  selection,
  catalog,
  isMissing,
  subtotal,
  isLocked,
  photo,
  onName,
  onNote,
  onBase,
  onAddOn,
  onRemove,
}: {
  label: string
  title: string
  category: string
  note: string
  selection: Selection
  catalog: CategoryCatalog
  isMissing: boolean
  subtotal: number
  isLocked: boolean
  photo: string | null
  onName: (name: string) => void
  onNote: (note: string) => void
  onBase: (id: number) => void
  onAddOn: (id: number) => void
  onRemove?: () => void
}) {
  const noteId = useId()
  const nameId = useId()

  return (
    <article
      aria-label={`${label} · ${title}`}
      className={cn(
        'overflow-hidden rounded-lg bg-card',
        isMissing ? 'border-[1.5px] border-destructive-border-soft' : 'border border-border'
      )}
    >
      <header className="flex items-center gap-2.5 border-b border-border px-4 py-3">
        <span className="rounded-xs bg-muted px-1.75 py-1 font-mono text-[11.5px] leading-none font-semibold">
          {label}
        </span>
        <h2 className="min-w-0 flex-1 text-base leading-[1.3] font-semibold">
          {title || category}
        </h2>
        <span className="h-badge rounded-pill border border-border-strong px-2.25 text-caption leading-5.5 font-medium">
          {category}
        </span>
        {onRemove && !isLocked && (
          <Button
            variant="ghost"
            size="icon-compact"
            aria-label={`Hapus ${label}`}
            onPress={onRemove}
          >
            <IconTrash className="size-4.5" />
          </Button>
        )}
      </header>
      <div className="grid grid-cols-[88px_minmax(0,1fr)] items-start gap-3.5 px-4 py-3.5">
        {photo ? (
          <a href={photo} target="_blank" rel="noreferrer" className="block">
            <img
              src={photo}
              alt="Foto barang saat diterima"
              className="aspect-square w-full rounded-sm object-cover"
            />
          </a>
        ) : (
          <MediaPlaceholder
            label="belum ada foto"
            size="sm"
            className="box-border aspect-square p-1.25"
          />
        )}
        <div className="flex min-w-0 flex-col gap-1.5">
          <label htmlFor={nameId} className="text-note leading-[1.3] font-semibold">
            Nama barang
          </label>
          <Input
            id={nameId}
            value={title}
            readOnly={isLocked}
            placeholder="mis. Sneakers kanvas putih"
            onChange={(event) => onName(event.target.value.slice(0, 80))}
            className="px-3"
          />
          <label htmlFor={noteId} className="text-note leading-[1.3] font-semibold">
            Kondisi / catatan pemeriksaan
          </label>
          <Textarea
            id={noteId}
            rows={2}
            value={note}
            readOnly={isLocked}
            placeholder="mis. noda di bagian depan, sol menguning"
            onChange={(event) => onNote(event.target.value)}
            className="min-h-15 px-3 py-2.5 text-[14.5px] leading-[1.45]"
          />
        </div>
      </div>
      <div className="flex flex-col gap-3 px-4 pb-4">
        <OptionGroup
          role="radio"
          title="Layanan utama"
          hint="pilih satu"
          options={catalog.base}
          isOn={(id) => selection.main === id}
          onPick={onBase}
          isLocked={isLocked}
        />
        <OptionGroup
          role="checkbox"
          title="Tambahan"
          hint="boleh lebih dari satu"
          options={catalog.adds}
          isOn={(id) => selection.addons.includes(id)}
          onPick={onAddOn}
          isLocked={isLocked}
        />
        {isMissing && (
          <p
            role="alert"
            className="flex items-center gap-1.5 text-note leading-[1.4] font-medium text-destructive-text"
          >
            <IconAlertCircle className="size-4.25" />
            Isi nama barang dan pilih layanan utama.
          </p>
        )}
        <div className="flex items-baseline justify-between border-t border-dashed border-border-strong pt-2.5 text-[15px] leading-[1.3] font-semibold">
          <span>Subtotal</span>
          <span>{formatRupiah(subtotal)}</span>
        </div>
      </div>
    </article>
  )
}
