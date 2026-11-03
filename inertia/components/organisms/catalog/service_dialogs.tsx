import { useId, useState, type ReactNode } from 'react'
import { Button } from '~/components/ui/button'
import { Dialog, DialogClose, DialogDescription } from '~/components/ui/dialog'
import { Field, FieldDescription, FieldError, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
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

export function ServiceFormDialog({
  isOpen,
  onOpenChange,
  isEditing,
  initial,
  onSave,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  isEditing: boolean
  initial: ServiceForm
  onSave: (form: ServiceForm) => void
}) {
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({})
  const nameId = useId()
  const priceId = useId()
  const daysId = useId()
  const descriptionId = useId()
  const typeId = useId()
  const categoryId = useId()
  const update = (patch: Partial<ServiceForm>) => setForm((current) => ({ ...current, ...patch }))

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} variant="panel">
      <DialogTitleBar>{isEditing ? 'Ubah layanan' : 'Tambah layanan'}</DialogTitleBar>
      <Field className="min-w-0 gap-1.5">
        <FieldLabel htmlFor={nameId} className="text-note leading-[1.2]">
          Nama layanan
        </FieldLabel>
        <Input
          id={nameId}
          autoComplete="off"
          placeholder="mis. Deep Clean"
          value={form.name}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? `${nameId}-error` : undefined}
          onChange={(event) => update({ name: event.target.value })}
          className="px-3"
        />
        {errors.name && (
          <FieldError id={`${nameId}-error`} className="text-meta">
            {errors.name}
          </FieldError>
        )}
      </Field>
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
          isMultiple
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
        <Field className="min-w-0 gap-1.5">
          <FieldLabel htmlFor={priceId} className="text-note leading-[1.2]">
            Harga (Rp)
          </FieldLabel>
          <Input
            id={priceId}
            autoComplete="off"
            inputMode="numeric"
            placeholder="45000"
            value={form.price}
            aria-invalid={errors.price ? true : undefined}
            aria-describedby={errors.price ? `${priceId}-error` : undefined}
            onChange={(event) =>
              update({ price: event.target.value.replace(/\D/g, '').slice(0, 9) })
            }
            className="px-3"
          />
          {errors.price && (
            <FieldError id={`${priceId}-error`} className="text-meta">
              {errors.price}
            </FieldError>
          )}
        </Field>
        <Field className="min-w-0 gap-1.5">
          <FieldLabel htmlFor={daysId} className="text-note leading-[1.2]">
            Estimasi (hari)
          </FieldLabel>
          <Input
            id={daysId}
            autoComplete="off"
            inputMode="numeric"
            placeholder="3"
            value={form.days}
            onChange={(event) =>
              update({ days: event.target.value.replace(/\D/g, '').slice(0, 9) })
            }
            className="px-3"
          />
        </Field>
      </div>
      <Field className="min-w-0 gap-1.5">
        <FieldLabel htmlFor={descriptionId} className="text-note leading-[1.2]">
          Deskripsi singkat (opsional)
        </FieldLabel>
        <Input
          id={descriptionId}
          autoComplete="off"
          placeholder="Terlihat oleh staf saat memilih"
          value={form.description}
          onChange={(event) => update({ description: event.target.value })}
          className="px-3"
        />
      </Field>
      <Switch
        isSelected={form.active}
        onChange={(isActive) => update({ active: isActive })}
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
            if (!Object.keys(found).length) {
              onSave(form)
            }
          }}
        >
          {isEditing ? 'Simpan perubahan' : 'Tambah layanan'}
        </Button>
      </div>
    </Dialog>
  )
}

export function DeleteServicesDialog({
  isOpen,
  onOpenChange,
  title,
  names,
  confirmLabel,
  onDeactivate,
  onDelete,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  names?: string[]
  confirmLabel: string
  onDeactivate: () => void
  onDelete: () => void
}) {
  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} variant="panel">
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
