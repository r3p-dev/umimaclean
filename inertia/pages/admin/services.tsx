import { useState } from 'react'
import { Head } from '@inertiajs/react'
import { toast } from 'sonner'
import {
  IconInfoCircle,
  IconPencil,
  IconPlus,
  IconToggleLeft,
  IconToggleRight,
  IconTrash,
} from '@tabler/icons-react'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Switch } from '~/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import ToneBadge from '~/components/atoms/tone_badge'
import ExportButton from '~/components/molecules/export_button'
import { FilterMenu } from '~/components/molecules/filter_menu'
import SearchField from '~/components/molecules/search_field'
import SortHeader from '~/components/molecules/sort_header'
import TablePagination from '~/components/molecules/table_pagination'
import AdminPageHeader from '~/components/organisms/admin_page_header'
import {
  DeleteServicesDialog,
  ServiceFormDialog,
} from '~/components/organisms/catalog/service_dialogs'
import {
  BulkBar,
  CHECK_CELL,
  FilterSummary,
  SelectAllRow,
  TABLE_HEAD_ROW,
  TableEmpty,
} from '~/components/organisms/data_table/table_parts'
import AdminLayout from '~/components/templates/admin_layout'
import {
  EMPTY_SERVICE_FORM,
  SERVICE_CATEGORIES,
  SERVICE_TYPES,
  deleteServices,
  saveService,
  services,
  setServicesActive,
  type Service,
  type ServiceCategory,
  type ServiceForm,
  type ServiceType,
} from '~/lib/catalog/services'
import { useDataTable } from '~/lib/shared/data_table'
import { formatRupiah } from '~/lib/shared/format'
import { cn } from '~/lib/shared/utils'

type DialogState =
  | { kind: 'form'; id: string | null; initial: ServiceForm }
  | { kind: 'delete'; id: string }
  | { kind: 'bulk-delete' }
  | null

function TypeBadge({ type }: { type: ServiceType }) {
  return (
    <ToneBadge tone={type === 'utama' ? 'info' : 'off'}>
      {type === 'utama' ? 'Utama' : 'Tambahan'}
    </ToneBadge>
  )
}

export default function AdminServices() {
  const list = services.use()
  const [types, setTypes] = useState<ServiceType[]>([])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [showInactive, setShowInactive] = useState(true)
  const [query, setQuery] = useState('')
  const [dialog, setDialog] = useState<DialogState>(null)
  const search = query.trim().toLowerCase()

  const matches = (service: Service, skip?: 'type' | 'category') =>
    (skip === 'type' || !types.length || types.includes(service.type)) &&
    (skip === 'category' ||
      !categories.length ||
      service.categories.some((category) => categories.includes(category))) &&
    (showInactive || service.active) &&
    (!search || `${service.name} ${service.description}`.toLowerCase().includes(search))

  const table = useDataTable<Service>(
    list.filter((service) => matches(service)),
    [
      { key: 'name', value: (row) => row.name },
      { key: 'type', value: (row) => (row.type === 'utama' ? 0 : 1) },
      { key: 'price', value: (row) => row.price, dir: 'desc' },
      { key: 'days', value: (row) => row.days },
      { key: 'active', value: (row) => (row.active ? 0 : 1) },
    ],
    { unit: 'layanan' }
  )
  const selectedIds = table.selectedRows.map((row) => row.id)
  const parts: string[] = []
  if (search) parts.push(`kata kunci “${query.trim()}”`)
  if (types.length) {
    parts.push(
      `jenis: ${types.map((type) => (type === 'utama' ? 'Utama' : 'Tambahan')).join(', ')}`
    )
  }
  if (categories.length) parts.push(`kategori: ${categories.join(', ')}`)
  if (!showInactive) parts.push('nonaktif disembunyikan')

  function changeFilter(change: () => void) {
    change()
    table.resetPage()
  }

  function resetFilters() {
    changeFilter(() => {
      setQuery('')
      setTypes([])
      setCategories([])
      setShowInactive(true)
    })
  }

  function toggleActive(service: Service) {
    setServicesActive([service.id], !service.active)
    toast.success(`${service.name} ${service.active ? 'dinonaktifkan.' : 'diaktifkan.'}`)
  }

  function edit(service: Service) {
    setDialog({
      kind: 'form',
      id: service.id,
      initial: {
        name: service.name,
        type: service.type,
        categories: service.categories,
        price: String(service.price),
        days: String(service.days),
        description: service.description,
        active: service.active,
      },
    })
  }

  const deleting = dialog?.kind === 'delete' ? list.find((item) => item.id === dialog.id) : null

  const exportButton = (size: 'desktop' | 'compact') => (
    <ExportButton
      size={size}
      selectedCount={table.selectedCount}
      ariaLabel={`Unduh Excel — ${table.selectedCount ? `${table.selectedCount} layanan terpilih` : `${table.total} layanan sesuai filter`}`}
      build={() => {
        const rows = table.selectedCount ? table.selectedRows : table.sorted
        return {
          name: 'layanan',
          title: 'Layanan & Harga Umima',
          unit: 'layanan',
          count: rows.length,
          sheets: [
            {
              name: 'Layanan',
              columns: [
                { label: 'Layanan', width: 20 },
                { label: 'Jenis', width: 11 },
                { label: 'Kategori', width: 18 },
                { label: 'Harga', type: 'rp', width: 12 },
                { label: 'Estimasi (hari)', type: 'int', width: 14 },
                { label: 'Status', width: 10 },
                { label: 'Deskripsi', width: 44 },
              ],
              rows: rows.map((row) => [
                row.name,
                row.type === 'utama' ? 'Utama' : 'Tambahan',
                row.categories.join(', '),
                row.price,
                row.days,
                row.active ? 'Aktif' : 'Nonaktif',
                row.description,
              ]),
            },
          ],
        }
      }}
    />
  )

  const rowActions = (service: Service) => (
    <>
      <Button
        variant="outline"
        size="icon"
        aria-label={`Ubah ${service.name}`}
        onPress={() => edit(service)}
      >
        <IconPencil className="size-4.5" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        aria-label={`Hapus ${service.name}`}
        onPress={() => setDialog({ kind: 'delete', id: service.id })}
        className="text-destructive-text"
      >
        <IconTrash className="size-4.5" />
      </Button>
    </>
  )

  return (
    <AdminLayout active="layanan" title="Layanan & Harga">
      <Head title="Layanan & Harga" />
      <AdminPageHeader
        title="Layanan & Harga"
        actions={
          <>
            {exportButton('desktop')}
            <Button
              size="desktop"
              onPress={() => setDialog({ kind: 'form', id: null, initial: EMPTY_SERVICE_FORM })}
              className="gap-1.5"
            >
              <IconPlus className="size-4.5" />
              Tambah layanan
            </Button>
          </>
        }
      />
      <p className="flex items-start gap-2.5 rounded-md bg-accent px-3.5 py-3 text-[13.5px] leading-[1.45] font-medium text-info-foreground">
        <IconInfoCircle className="size-5 shrink-0" />
        Perubahan harga berlaku untuk pemeriksaan berikutnya. Tagihan yang sudah dikirim tidak
        berubah. Semua perubahan tercatat di Aktivitas Staf.
      </p>
      <div className="flex min-w-0 flex-col gap-3 rounded-lg border border-border bg-card px-4 py-3.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <FilterMenu<ServiceType>
            word="Jenis"
            label="Filter jenis layanan"
            values={types}
            onChange={(value) => changeFilter(() => setTypes(value))}
            options={SERVICE_TYPES.map((type) => ({
              ...type,
              count: list.filter(
                (service) => service.type === type.value && matches(service, 'type')
              ).length,
            }))}
          />
          <FilterMenu<ServiceCategory>
            word="Kategori"
            label="Filter kategori barang"
            values={categories}
            onChange={(value) => changeFilter(() => setCategories(value))}
            options={SERVICE_CATEGORIES.map((category) => ({
              value: category,
              label: category,
              count: list.filter(
                (service) => service.categories.includes(category) && matches(service, 'category')
              ).length,
            }))}
          />
          <Switch
            isSelected={showInactive}
            onChange={(checked) => changeFilter(() => setShowInactive(checked))}
            className="min-h-icon-btn cursor-pointer gap-2.5"
          >
            <span className="text-sm leading-tight font-medium">Tampilkan layanan nonaktif</span>
          </Switch>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <SearchField
            label="Cari nama atau deskripsi layanan"
            placeholder="Cari layanan"
            value={query}
            onChange={(value) => changeFilter(() => setQuery(value))}
          />
        </div>
        {parts.length > 0 && (
          <FilterSummary
            text={`${table.total} dari ${list.length} layanan · ${parts.join(' · ')}`}
            onReset={resetFilters}
          />
        )}
      </div>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {table.selectedCount > 0 && (
          <BulkBar
            label="Aksi untuk baris terpilih"
            count={table.selectedCount}
            total={table.total}
            canSelectAll={table.canSelectAll}
            onSelectAll={table.selectAll}
            onClear={table.clear}
          >
            <Button
              variant="outline"
              size="compact"
              isDisabled={table.selectedRows.every((row) => row.active)}
              onPress={() => {
                const count = table.selectedRows.filter((row) => !row.active).length
                setServicesActive(selectedIds, true)
                table.clear()
                toast.success(`${count} layanan diaktifkan.`)
              }}
              className="text-[13.5px]"
            >
              <IconToggleRight className="size-4.5" />
              Aktifkan
            </Button>
            <Button
              variant="outline"
              size="compact"
              isDisabled={table.selectedRows.every((row) => !row.active)}
              onPress={() => {
                const count = table.selectedRows.filter((row) => row.active).length
                setServicesActive(selectedIds, false)
                table.clear()
                toast.success(`${count} layanan dinonaktifkan. Tidak tampil di pilihan staf.`)
              }}
              className="text-[13.5px]"
            >
              <IconToggleLeft className="size-4.5" />
              Nonaktifkan
            </Button>
            <Button
              variant="destructive-outline"
              size="compact"
              onPress={() => setDialog({ kind: 'bulk-delete' })}
              className="border-destructive-border-soft text-[13.5px]"
            >
              <IconTrash className="size-4.5" />
              Hapus
            </Button>
            {exportButton('compact')}
          </BulkBar>
        )}
        {table.total > 0 && <SelectAllRow state={table.allState} onToggle={table.toggleAll} />}
        {table.total > 0 && (
          <Table className="max-sm:hidden">
            <TableHeader>
              <tr className={TABLE_HEAD_ROW}>
                <TableHead className={CHECK_CELL}>
                  <Checkbox
                    isSelected={table.allState === true}
                    isIndeterminate={table.allState === 'indeterminate'}
                    onChange={table.toggleAll}
                    aria-label="Pilih semua baris di halaman ini"
                  />
                </TableHead>
                <SortHeader sort={table.ariaSort('name')} onSort={() => table.sortBy('name')}>
                  Layanan
                </SortHeader>
                <SortHeader sort={table.ariaSort('type')} onSort={() => table.sortBy('type')}>
                  Jenis
                </SortHeader>
                <TableHead>Kategori</TableHead>
                <SortHeader
                  sort={table.ariaSort('price')}
                  align="right"
                  onSort={() => table.sortBy('price')}
                >
                  Harga
                </SortHeader>
                <SortHeader
                  sort={table.ariaSort('days')}
                  onSort={() => table.sortBy('days')}
                  className="max-lg:hidden"
                >
                  Estimasi
                </SortHeader>
                <SortHeader sort={table.ariaSort('active')} onSort={() => table.sortBy('active')}>
                  Aktif
                </SortHeader>
                <TableHead className="pr-4.5 last:pr-4.5" />
              </tr>
            </TableHeader>
            <TableBody>
              {table.rows.map((row) => {
                const selected = table.isSelected(row.id)
                return (
                  <TableRow key={row.id} data-selected={selected}>
                    <TableCell className={CHECK_CELL}>
                      <Checkbox
                        isSelected={selected}
                        onChange={() => table.toggle(row.id)}
                        aria-label={`Pilih ${row.label}`}
                      />
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="font-semibold">{row.name}</div>
                      <div className="text-caption leading-[1.35] text-muted-foreground">
                        {row.description}
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <TypeBadge type={row.type} />
                    </TableCell>
                    <TableCell className="py-2 text-foreground-secondary">
                      {row.categories.join(', ')}
                    </TableCell>
                    <TableCell className="py-2 text-right font-semibold tabular-nums">
                      {formatRupiah(row.price)}
                    </TableCell>
                    <TableCell className="py-2 text-foreground-secondary max-lg:hidden">
                      {row.days} hari
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          isSelected={row.active}
                          onChange={() => toggleActive(row)}
                          aria-label={`Aktifkan ${row.name}`}
                        />
                        <span className="text-meta leading-none font-medium text-foreground-secondary">
                          {row.active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2 pr-4.5 last:pr-4.5">
                      <div className="flex justify-end gap-1.5">{rowActions(row)}</div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
        <ul className="sm:hidden">
          {table.rows.map((row) => {
            const selected = table.isSelected(row.id)
            return (
              <li
                key={row.id}
                data-selected={selected}
                className={cn(
                  'flex items-start gap-0.5 border-t border-border pt-2 pr-4 pb-3 pl-1',
                  selected && 'bg-row-selected'
                )}
              >
                <Checkbox
                  isSelected={selected}
                  onChange={() => table.toggle(row.id)}
                  aria-label={`Pilih ${row.label}`}
                />
                <div className="flex min-w-0 flex-1 flex-col gap-2 pt-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex-1 text-[15px] leading-[1.3] font-semibold">
                      {row.name}
                    </span>
                    <span className="text-[15px] leading-none font-semibold">
                      {formatRupiah(row.price)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <TypeBadge type={row.type} />
                    <span className="text-meta leading-[1.3] text-muted-foreground">
                      {row.categories.join(', ')} · {row.days} hari
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      isSelected={row.active}
                      onChange={() => toggleActive(row)}
                      aria-label={`Aktifkan ${row.name}`}
                    />
                    <span className="flex-1 text-meta leading-none font-medium text-foreground-secondary">
                      {row.active ? 'Aktif' : 'Nonaktif'}
                    </span>
                    {rowActions(row)}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
        {table.total === 0 && (
          <TableEmpty
            title="Tidak ada layanan yang cocok"
            description="Ubah filter, kata kunci, atau tampilkan layanan nonaktif."
            onReset={resetFilters}
          />
        )}
        <TablePagination
          rangeText={table.rangeText}
          page={table.page}
          pages={table.pages}
          pageNumbers={table.pageNumbers}
          size={table.size}
          onPage={table.setPage}
          onSize={table.setSize}
        />
      </div>
      {dialog?.kind === 'form' && (
        <ServiceFormDialog
          open
          onOpenChange={(open) => !open && setDialog(null)}
          editing={dialog.id !== null}
          initial={dialog.initial}
          onSave={(form) => {
            saveService(form, dialog.id)
            setDialog(null)
            if (dialog.id)
              toast.success('Perubahan disimpan. Berlaku untuk pemeriksaan berikutnya.')
            else {
              changeFilter(() => {
                setQuery('')
                setTypes([])
                setCategories([])
                setShowInactive(true)
              })
              toast.success(`${form.name.trim()} ditambahkan.`)
            }
          }}
        />
      )}
      <DeleteServicesDialog
        open={dialog?.kind === 'delete'}
        onOpenChange={(open) => !open && setDialog(null)}
        title={`Hapus “${deleting?.name ?? ''}”?`}
        confirmLabel="Hapus layanan"
        onDeactivate={() => {
          if (deleting) setServicesActive([deleting.id], false)
          setDialog(null)
          toast.success(`${deleting?.name ?? 'Layanan'} dinonaktifkan.`)
        }}
        onDelete={() => {
          if (deleting) deleteServices([deleting.id])
          setDialog(null)
          toast.success(`${deleting?.name ?? 'Layanan'} dihapus.`)
        }}
      />
      <DeleteServicesDialog
        open={dialog?.kind === 'bulk-delete'}
        onOpenChange={(open) => !open && setDialog(null)}
        title={`Hapus ${table.selectedCount} layanan?`}
        names={table.selectedRows.map((row) => row.name)}
        confirmLabel={`Hapus ${table.selectedCount} layanan`}
        onDeactivate={() => {
          setServicesActive(selectedIds, false)
          setDialog(null)
          table.clear()
          toast.success(`${selectedIds.length} layanan dinonaktifkan.`)
        }}
        onDelete={() => {
          deleteServices(selectedIds)
          setDialog(null)
          table.clear()
          toast.success(`${selectedIds.length} layanan dihapus.`)
        }}
      />
    </AdminLayout>
  )
}
