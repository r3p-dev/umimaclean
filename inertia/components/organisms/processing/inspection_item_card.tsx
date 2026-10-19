import { useId } from 'react'
import { IconAlertCircle } from '@tabler/icons-react'
import MediaPlaceholder from '~/components/atoms/media_placeholder'
import { Textarea } from '~/components/ui/textarea'
import ChoiceRow from '~/components/molecules/choice_row'
import type { ServiceOption, Selection } from '~/lib/processing/catalog'
import { formatRupiah } from '~/lib/shared/format'
import { cn } from '~/lib/shared/utils'

function OptionGroup({
  role,
  title,
  hint,
  options,
  isOn,
  onPick,
  locked,
}: {
  role: 'radio' | 'checkbox'
  title: string
  hint: string
  options: ServiceOption[]
  isOn: (name: string) => boolean
  onPick: (name: string) => void
  locked: boolean
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
        {options.map((option) => (
          <ChoiceRow
            key={option.name}
            role={role}
            checked={isOn(option.name)}
            disabled={locked}
            onChange={() => onPick(option.name)}
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
  missing,
  subtotal,
  locked,
  onNote,
  onBase,
  onAddOn,
}: {
  label: string
  title: string
  category: string
  note: string
  selection: Selection
  catalog: { base: ServiceOption[]; adds: ServiceOption[] }
  missing: boolean
  subtotal: number
  locked: boolean
  onNote: (note: string) => void
  onBase: (name: string) => void
  onAddOn: (name: string) => void
}) {
  const noteId = useId()

  return (
    <article
      aria-label={`${label} · ${title}`}
      className={cn(
        'overflow-hidden rounded-lg bg-card',
        missing ? 'border-[1.5px] border-destructive-border-soft' : 'border border-border'
      )}
    >
      <header className="flex items-center gap-2.5 border-b border-border px-4 py-3">
        <span className="rounded-xs bg-muted px-1.75 py-1 font-mono text-[11.5px] leading-none font-semibold">
          {label}
        </span>
        <h2 className="min-w-0 flex-1 text-base leading-[1.3] font-semibold">{title}</h2>
        <span className="h-badge rounded-pill border border-border-strong px-2.25 text-caption leading-5.5 font-medium">
          {category}
        </span>
      </header>
      <div className="grid grid-cols-[88px_minmax(0,1fr)] items-start gap-3.5 px-4 py-3.5">
        <MediaPlaceholder
          label="foto saat diterima"
          size="sm"
          className="box-border aspect-square p-1.25"
        />
        <div className="flex min-w-0 flex-col gap-1.5">
          <label htmlFor={noteId} className="text-note leading-[1.3] font-semibold">
            Kondisi / catatan pemeriksaan
          </label>
          <Textarea
            id={noteId}
            rows={2}
            value={note}
            readOnly={locked}
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
          isOn={(name) => selection.base === name}
          onPick={onBase}
          locked={locked}
        />
        <OptionGroup
          role="checkbox"
          title="Tambahan"
          hint="boleh lebih dari satu"
          options={catalog.adds}
          isOn={(name) => selection.adds.includes(name)}
          onPick={onAddOn}
          locked={locked}
        />
        {missing && (
          <p
            role="alert"
            className="flex items-center gap-1.5 text-note leading-[1.4] font-medium text-destructive-text"
          >
            <IconAlertCircle className="size-4.25" />
            Pilih layanan utama untuk barang ini.
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
