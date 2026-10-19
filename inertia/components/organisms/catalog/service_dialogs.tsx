import { useId, useState, type ReactNode } from 'react'
import { Button } from '~/components/ui/button'
import { Dialog, DialogClose, DialogDescription } from '~/components/ui/dialog'
import { FieldDescription, FieldError } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Switch } from '~/components/ui/switch'
import ChoicePills from '~/components/molecules/choice_pills'
import DialogTitleBar from '~/components/molecules/dialog_title_bar'
import {
  SERVICE_CATEGORIES,
  SERVICE_TYPES,
  serviceFormErrors,
  type ServiceForm,
} from '~/lib/catalog/services'

const FOOTER = 'flex flex-col-reverse justify-end gap-2 sm:flex-row sm:items-center'

function TextField({
  label,
  value,
  onChange,
  placeholder,
  numeric,
  error,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  numeric?: boolean
  error?: string
}) {
  const id = useId()
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label htmlFor={id} className="text-note leading-[1.2]">
        {label}
      </Label>
      <Input
        id={id}
        autoComplete="off"
        inputMode={numeric ? 'numeric' : undefined}
        placeholder={placeholder}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) =>
          onChange(numeric ? event.target.value.replace(/\D/g, '').slice(0, 9) : event.target.value)
        }
        className="px-3"
      />
      {error && (
        <FieldError id={`${id}-error`} className="text-meta">
          {error}
        </FieldError>
      )}
    </div>
  )
}

export function ServiceFormDialog({
  open,
  onOpenChange,
  editing,
  initial,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: boolean
  initial: ServiceForm
  onSave: (form: ServiceForm) => void
}) {
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({})
  const typeId = useId()
  const categoryId = useId()
  const update = (patch: Partial<ServiceForm>) => setForm((current) => ({ ...current, ...patch }))

  return (
    <Dialog isOpen={open} onOpenChange={onOpenChange} variant="panel">
      <DialogTitleBar>{editing ? 'Ubah layanan' : 'Tambah layanan'}</DialogTitleBar>
      <TextField
        label="Nama layanan"
        placeholder="mis. Deep Clean"
        value={form.name}
        onChange={(name) => update({ name })}
        error={errors.name}
      />
      <div className="flex flex-col gap-1.5">
        <span id={typeId} className="text-note leading-[1.2] font-semibold">
          Jenis
        </span>
        <ChoicePills
          labelledBy={typeId}
          value={form.type}
          onChange={(type) => update({ type })}
          options={SERVICE_TYPES}
        />
        <FieldDescription className="text-caption leading-[1.4]">
          Utama: pilih satu per barang. Tambahan: boleh lebih dari satu.
        </FieldDescription>
      </div>
      <div className="flex flex-col gap-1.5">
        <span id={categoryId} className="text-note leading-[1.2] font-semibold">
          Kategori barang
        </span>
        <ChoicePills
          labelledBy={categoryId}
          multiple
          value={form.categories}
          onChange={(category) =>
            update({
              categories: form.categories.includes(category)
                ? form.categories.filter((item) => item !== category)
                : [...form.categories, category],
            })
          }
          options={SERVICE_CATEGORIES.map((category) => ({ value: category, label: category }))}
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField
          label="Harga (Rp)"
          placeholder="45000"
          numeric
          value={form.price}
          onChange={(price) => update({ price })}
          error={errors.price}
        />
        <TextField
          label="Estimasi (hari)"
          placeholder="3"
          numeric
          value={form.days}
          onChange={(days) => update({ days })}
        />
      </div>
      <TextField
        label="Deskripsi singkat (opsional)"
        placeholder="Terlihat oleh staf saat memilih"
        value={form.description}
        onChange={(description) => update({ description })}
      />
      <Switch
        isSelected={form.active}
        onChange={(active) => update({ active })}
        className="flex gap-2.5"
      >
        <span className="text-sm leading-[1.3] font-medium">Aktif — tampil di pilihan staf</span>
      </Switch>
      <div className={FOOTER}>
        <DialogClose variant="outline" size="desktop">
          Batal
        </DialogClose>
        <Button
          size="desktop"
          onPress={() => {
            const found = serviceFormErrors(form)
            setErrors(found)
            if (!Object.keys(found).length) onSave(form)
          }}
        >
          {editing ? 'Simpan perubahan' : 'Tambah layanan'}
        </Button>
      </div>
    </Dialog>
  )
}

export function DeleteServicesDialog({
  open,
  onOpenChange,
  title,
  names,
  confirmLabel,
  onDeactivate,
  onDelete,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  names?: string[]
  confirmLabel: string
  onDeactivate: () => void
  onDelete: () => void
}) {
  return (
    <Dialog isOpen={open} onOpenChange={onOpenChange} variant="panel">
      <DialogTitleBar>{title}</DialogTitleBar>
      <DialogDescription className="text-note leading-normal">
        Layanan yang pernah dipakai di pesanan tetap tampil di riwayat dan laporan. Bila hanya ingin
        menyembunyikannya dari pilihan staf, pilih Nonaktifkan.
      </DialogDescription>
      {names && names.length > 0 && (
        <ul className="max-h-40 list-disc overflow-auto rounded-md bg-muted py-2.5 pr-3 pl-7.5 text-[13.5px] leading-[1.6] font-medium">
          {names.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      )}
      <div className={FOOTER}>
        <DialogClose variant="outline" size="desktop">
          Batal
        </DialogClose>
        <Button variant="outline" size="desktop" onPress={onDeactivate}>
          Nonaktifkan saja
        </Button>
        <Button variant="destructive" size="desktop" onPress={onDelete}>
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  )
}
