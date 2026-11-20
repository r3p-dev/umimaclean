import { useMemo, useState, type ReactNode } from 'react'
import { Head, router } from '@inertiajs/react'
import {
  IconCheck,
  IconDots,
  IconPencil,
  IconPlus,
  IconSearch,
  IconTag,
  IconTrash,
  IconX,
} from '@tabler/icons-react'
import { cn } from 'cn'
import CsrfField from '~/components/atoms/csrf_field'
import OwnerPageHeader from '~/components/organisms/owner_page_header'
import OwnerLayout from '~/components/templates/owner_layout'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown_menu'
import { Field, FieldDescription, FieldError, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { Switch } from '~/components/ui/switch'
import { Textarea } from '~/components/ui/textarea'
import { ItemKind, ItemKindLabel, ServiceType, ServiceTypeLabel } from '~/lib/service_enums'
import type { Data } from '@generated/data'
import { formatRupiah } from '~/lib/format'
import { FULL_SCREEN_ON_PHONE } from '~/lib/ui/dialog_layouts'

export type ServiceItem = Data.Service

interface ServiceFormState {
  name: string
  type: ServiceType
  itemKinds: ItemKind[]
  price: number
  estimatedDays: number
  isStartingFrom: boolean
  description: string
  isActive: boolean
}

const DEFAULT_FORM: ServiceFormState = {
  name: '',
  type: ServiceType.MAIN,
  itemKinds: [ItemKind.SHOE],
  price: 50_000,
  estimatedDays: 3,
  isStartingFrom: false,
  description: '',
  isActive: true,
}

export default function AdminServices({ services }: { services: ServiceItem[] }) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | ServiceType>('all')
  const [kindFilter, setKindFilter] = useState<'all' | ItemKind>('all')
  const [showInactive, setShowInactive] = useState(true)
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const [formOpen, setFormOpen] = useState(false)
  const [editingService, setEditingService] = useState<ServiceItem | null>(null)
  const [formState, setFormState] = useState<ServiceFormState>(DEFAULT_FORM)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [deletingService, setDeletingService] = useState<ServiceItem | null>(null)

  const activeCount = useMemo(() => services.filter((s) => s.isActive).length, [services])

  const filteredServices = useMemo(() => {
    const q = search.trim().toLowerCase()
    return services.filter((s) => {
      if (!showInactive && !s.isActive) return false
      if (typeFilter !== 'all' && s.type !== typeFilter) return false
      if (kindFilter !== 'all' && !s.itemKinds.includes(kindFilter)) return false
      if (q && !s.name.toLowerCase().includes(q) && !s.description.toLowerCase().includes(q)) {
        return false
      }
      return true
    })
  }, [services, search, typeFilter, kindFilter, showInactive])

  const allVisibleSelected =
    filteredServices.length > 0 && filteredServices.every((s) => selectedIds.includes(s.id))

  function handleSelectAll() {
    if (allVisibleSelected) {
      const visibleIds = new Set(filteredServices.map((s) => s.id))
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.has(id)))
    } else {
      const newIds = new Set([...selectedIds, ...filteredServices.map((s) => s.id)])
      setSelectedIds(Array.from(newIds))
    }
  }

  function handleToggleRow(id: number) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  function handleOpenCreate() {
    setEditingService(null)
    setFormState(DEFAULT_FORM)
    setFormErrors({})
    setFormOpen(true)
  }

  function handleOpenEdit(service: ServiceItem) {
    setEditingService(service)
    setFormState({
      name: service.name,
      type: service.type,
      itemKinds: [...service.itemKinds],
      price: service.price,
      estimatedDays: service.estimatedDays,
      isStartingFrom: service.isStartingFrom,
      description: service.description,
      isActive: service.isActive,
    })
    setFormErrors({})
    setFormOpen(true)
  }

  function handleFormSubmit() {
    const errors: Record<string, string> = {}
    if (!formState.name.trim()) {
      errors.name = 'Nama layanan wajib diisi.'
    }
    if (formState.itemKinds.length === 0) {
      errors.itemKinds = 'Pilih minimal satu jenis barang.'
    }
    if (formState.price < 0 || Number.isNaN(formState.price)) {
      errors.price = 'Harga tidak boleh kurang dari 0.'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setIsSubmitting(true)
    if (editingService) {
      router.put(
        `/admin/layanan/${editingService.id}`,
        { ...formState },
        {
          onSuccess: () => {
            setFormOpen(false)
            setIsSubmitting(false)
          },
          onError: (errs) => {
            setFormErrors(errs)
            setIsSubmitting(false)
          },
        }
      )
    } else {
      router.post(
        '/admin/layanan',
        { ...formState },
        {
          onSuccess: () => {
            setFormOpen(false)
            setIsSubmitting(false)
          },
          onError: (errs) => {
            setFormErrors(errs)
            setIsSubmitting(false)
          },
        }
      )
    }
  }

  function handleToggleActive(service: ServiceItem) {
    router.patch(
      `/admin/layanan/${service.id}/toggle`,
      { isActive: !service.isActive },
      { preserveScroll: true }
    )
  }

  function handleBulkToggle(isActive: boolean) {
    if (selectedIds.length === 0) return
    router.post(
      '/admin/layanan/bulk-toggle',
      { ids: selectedIds, isActive },
      {
        preserveScroll: true,
        onSuccess: () => setSelectedIds([]),
      }
    )
  }

  function handleDeleteConfirm() {
    if (!deletingService) return
    router.delete(`/admin/layanan/${deletingService.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        setDeletingService(null)
        setSelectedIds((prev) => prev.filter((id) => id !== deletingService.id))
      },
    })
  }

  function handleDeactivateInstead() {
    if (!deletingService) return
    router.patch(
      `/admin/layanan/${deletingService.id}/toggle`,
      { isActive: false },
      {
        preserveScroll: true,
        onSuccess: () => setDeletingService(null),
      }
    )
  }

  return (
    <>
      <Head title="Kelola Layanan & Harga" />
      <OwnerPageHeader
        title="Layanan & Harga"
        status={`${activeCount} aktif dari ${services.length} layanan terdaftar`}
        actions={
          <Button onPress={handleOpenCreate} className="gap-2">
            <IconPlus className="size-4" />
            Tambah Layanan
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-xs">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative flex items-center">
            <IconSearch className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari layanan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              aria-label="Cari layanan"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs font-medium text-muted-foreground">Jenis:</span>
            <button
              type="button"
              onClick={() => setTypeFilter('all')}
              className={cn(
                'rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
                typeFilter === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter(ServiceType.MAIN)}
              className={cn(
                'rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
                typeFilter === ServiceType.MAIN
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              Utama
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter(ServiceType.ADDON)}
              className={cn(
                'rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
                typeFilter === ServiceType.ADDON
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              Tambahan
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs font-medium text-muted-foreground">Kategori:</span>
            <button
              type="button"
              onClick={() => setKindFilter('all')}
              className={cn(
                'rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
                kindFilter === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setKindFilter(ItemKind.SHOE)}
              className={cn(
                'rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
                kindFilter === ItemKind.SHOE
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              Sepatu
            </button>
            <button
              type="button"
              onClick={() => setKindFilter(ItemKind.BAG)}
              className={cn(
                'rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
                kindFilter === ItemKind.BAG
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              Tas
            </button>
            <button
              type="button"
              onClick={() => setKindFilter(ItemKind.HELMET)}
              className={cn(
                'rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
                kindFilter === ItemKind.HELMET
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              Helm
            </button>
          </div>

          <div className="flex items-center justify-start gap-2 sm:justify-end">
            <Switch
              isSelected={showInactive}
              onChange={setShowInactive}
              aria-label="Tampilkan layanan nonaktif"
            />
            <span className="text-xs font-medium text-muted-foreground">Tampilkan nonaktif</span>
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/60 p-2.5">
            <span className="text-xs font-semibold text-foreground">
              {selectedIds.length} layanan dipilih
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onPress={() => handleBulkToggle(true)}
                className="h-8 gap-1 text-xs"
              >
                <IconCheck className="size-3.5 text-primary" />
                Aktifkan
              </Button>
              <Button
                variant="outline"
                size="sm"
                onPress={() => handleBulkToggle(false)}
                className="h-8 gap-1 text-xs"
              >
                <IconX className="size-3.5 text-destructive" />
                Nonaktifkan
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onPress={() => setSelectedIds([])}
                className="h-8 text-xs text-muted-foreground"
              >
                Batal
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Services Table (Desktop) & Cards (Mobile) */}
      <section aria-labelledby="heading-daftar-layanan" className="flex flex-col gap-3">
        <h2 id="heading-daftar-layanan" className="sr-only">
          Daftar Layanan
        </h2>

        {filteredServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
            <IconTag className="size-8 text-muted-foreground" />
            <h3 className="text-base font-semibold">Tidak ada layanan yang cocok</h3>
            <p className="max-w-md text-sm text-muted-foreground">
              Coba sesuaikan kata kunci pencarian atau tampilkan kembali layanan nonaktif.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
            {/* One compact row per service on every width (D107). */}
            <div className="flex items-center gap-3 border-b border-border bg-muted/40 px-4 py-2.5 text-xs font-semibold text-muted-foreground">
              <Checkbox
                isSelected={allVisibleSelected}
                onChange={handleSelectAll}
                aria-label="Pilih semua layanan"
              />
              <span className="flex-1">Layanan</span>
              <span className="hidden w-20 text-right sm:block">Estimasi</span>
              <span className="hidden w-24 text-right sm:block">Harga</span>
              <span className="w-24 text-right">Aktif</span>
            </div>
            <ul className="divide-y divide-border">
              {filteredServices.map((service) => {
                const isSelected = selectedIds.includes(service.id)
                const duration =
                  service.estimatedDays > 0 ? `${service.estimatedDays} hari` : 'Langsung'
                return (
                  <li
                    key={service.id}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 transition-colors',
                      isSelected && 'bg-primary/5',
                      !service.isActive && 'bg-muted/30'
                    )}
                  >
                    <Checkbox
                      isSelected={isSelected}
                      onChange={() => handleToggleRow(service.id)}
                      aria-label={`Pilih ${service.name}`}
                    />
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            'truncate font-medium',
                            service.isActive ? 'text-foreground' : 'text-muted-foreground'
                          )}
                        >
                          {service.name}
                        </span>
                        {service.isStartingFrom && (
                          <Badge
                            variant="outline"
                            className="hidden shrink-0 text-xs sm:inline-flex"
                          >
                            Mulai dari
                          </Badge>
                        )}
                      </div>
                      <span className="truncate text-xs text-muted-foreground">
                        {/* Phones fold price and duration into this line; the name keeps its room. */}
                        <span className="sm:hidden">
                          {service.isStartingFrom && 'mulai dari '}
                          {formatRupiah(service.price)} · {duration} ·{' '}
                        </span>
                        {ServiceTypeLabel[service.type]} ·{' '}
                        {service.itemKinds.map((kind) => ItemKindLabel[kind]).join(', ')}
                      </span>
                    </div>
                    <span className="hidden w-20 text-right text-sm text-muted-foreground sm:block">
                      {duration}
                    </span>
                    <span className="hidden w-24 text-right text-sm font-semibold text-foreground sm:block">
                      {formatRupiah(service.price)}
                    </span>
                    <div className="flex w-24 items-center justify-end gap-1">
                      <Switch
                        isSelected={service.isActive}
                        onChange={() => handleToggleActive(service)}
                        aria-label={`Status aktif ${service.name}`}
                      />
                      <DropdownMenuTrigger>
                        <Button variant="ghost" size="icon" aria-label={`Menu ${service.name}`}>
                          <IconDots aria-hidden="true" className="size-4" />
                        </Button>
                        <DropdownMenu placement="bottom end" className="w-auto min-w-36">
                          <DropdownMenuItem onAction={() => handleOpenEdit(service)}>
                            <IconPencil aria-hidden="true" />
                            Ubah
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onAction={() => setDeletingService(service)}
                          >
                            <IconTrash aria-hidden="true" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenu>
                      </DropdownMenuTrigger>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </section>

      {/* Add / Edit Service Dialog */}
      <Dialog
        isOpen={formOpen}
        onOpenChange={setFormOpen}
        className={cn('max-h-[calc(100dvh-2rem)] overflow-y-auto', FULL_SCREEN_ON_PHONE)}
      >
        <DialogHeader>
          <DialogTitle>{editingService ? 'Ubah Layanan' : 'Tambah Layanan Baru'}</DialogTitle>
          <DialogDescription>
            {editingService
              ? 'Perubahan tarif dan nama layanan akan tercatat dalam log aktivitas audit.'
              : 'Layanan baru akan langsung tersedia di katalog dan daftar pilihan operasional.'}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleFormSubmit()
          }}
          className="flex flex-col gap-4"
        >
          <CsrfField />

          <Field className="gap-1.5">
            <FieldLabel htmlFor="field-name">Nama Layanan</FieldLabel>
            <Input
              id="field-name"
              value={formState.name}
              onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Contoh: Deep Clean Premium"
              aria-invalid={formErrors.name ? true : undefined}
            />
            {formErrors.name && <FieldError>{formErrors.name}</FieldError>}
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field className="gap-1.5">
              <FieldLabel htmlFor="field-type">Jenis Layanan</FieldLabel>
              <select
                id="field-type"
                value={formState.type}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, type: e.target.value as ServiceType }))
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value={ServiceType.MAIN}>Layanan Utama (satu per barang)</option>
                <option value={ServiceType.ADDON}>Layanan Tambahan (opsional)</option>
              </select>
            </Field>

            <Field className="gap-1.5">
              <FieldLabel htmlFor="field-price">Harga (Rp)</FieldLabel>
              <Input
                id="field-price"
                type="number"
                min={0}
                step={1000}
                value={formState.price}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, price: Number(e.target.value) }))
                }
                aria-invalid={formErrors.price ? true : undefined}
              />
              {formErrors.price && <FieldError>{formErrors.price}</FieldError>}
            </Field>
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium text-foreground">Kategori Barang</legend>
            <div className="flex flex-wrap gap-4">
              {[ItemKind.SHOE, ItemKind.BAG, ItemKind.HELMET].map((kind) => {
                const checked = formState.itemKinds.includes(kind)
                return (
                  <Checkbox
                    key={kind}
                    isSelected={checked}
                    onChange={(selected) => {
                      setFormState((prev) => ({
                        ...prev,
                        itemKinds: selected
                          ? [...prev.itemKinds, kind]
                          : prev.itemKinds.filter((k) => k !== kind),
                      }))
                    }}
                    aria-label={ItemKindLabel[kind]}
                  >
                    {ItemKindLabel[kind]}
                  </Checkbox>
                )
              })}
            </div>
            {formErrors.itemKinds && <FieldError>{formErrors.itemKinds}</FieldError>}
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field className="gap-1.5">
              <FieldLabel htmlFor="field-days">Estimasi Pengerjaan (Hari)</FieldLabel>
              <Input
                id="field-days"
                type="number"
                min={0}
                max={30}
                value={formState.estimatedDays}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, estimatedDays: Number(e.target.value) }))
                }
              />
              <FieldDescription>
                Isi 0 jika pengerjaan instan / selesai di hari yang sama.
              </FieldDescription>
            </Field>

            <div className="flex flex-col justify-center gap-2 pt-2 sm:pt-4">
              <div className="flex items-center gap-2">
                <Switch
                  isSelected={formState.isStartingFrom}
                  onChange={(isStarting) =>
                    setFormState((prev) => ({ ...prev, isStartingFrom: isStarting }))
                  }
                  aria-label="Harga Mulai Dari"
                />
                <span className="text-sm font-medium text-foreground">
                  Harga &quot;Mulai dari&quot;
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Staf dapat menaikkan harga saat pemeriksaan fisik barang jika tingkat noda berat.
              </p>
            </div>
          </div>

          <Field className="gap-1.5">
            <FieldLabel htmlFor="field-desc">Deskripsi Singkat</FieldLabel>
            <Textarea
              id="field-desc"
              rows={2}
              value={formState.description}
              onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Penjelasan ringkas mengenai pengerjaan layanan..."
            />
          </Field>

          <div className="flex items-center gap-2">
            <Switch
              isSelected={formState.isActive}
              onChange={(active) => setFormState((prev) => ({ ...prev, isActive: active }))}
              aria-label="Status aktif layanan"
            />
            <span className="text-sm font-medium text-foreground">
              Aktif (tampil di pilihan staf dan katalog publik)
            </span>
          </div>

          <DialogFooter className="mt-2">
            <DialogClose variant="outline">Batal</DialogClose>
            <Button type="submit" isDisabled={isSubmitting}>
              {editingService ? 'Simpan Perubahan' : 'Tambah Layanan'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog (Soft Delete) */}
      <Dialog
        isOpen={deletingService !== null}
        onOpenChange={(open) => !open && setDeletingService(null)}
      >
        <DialogHeader>
          <DialogTitle>Hapus Layanan &quot;{deletingService?.name}&quot;?</DialogTitle>
          <DialogDescription>
            Layanan yang pernah digunakan di pesanan tetap tersimpan pada riwayat nota lama. Bila
            hanya ingin menyembunyikannya dari pilihan staf dan katalog, Anda cukup
            menonaktifkannya.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 gap-2">
          <DialogClose variant="outline">Batal</DialogClose>
          <Button variant="outline" onPress={handleDeactivateInstead}>
            Nonaktifkan saja
          </Button>
          <Button variant="destructive" onPress={handleDeleteConfirm}>
            Hapus Layanan
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  )
}

AdminServices.layout = (page: ReactNode) => (
  <OwnerLayout active="layanan" title="Layanan & Harga">
    {page}
  </OwnerLayout>
)
