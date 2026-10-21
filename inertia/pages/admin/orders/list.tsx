import { useMemo, useState } from 'react'
import { Head, router } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { IconArrowsExchange, IconBan } from '@tabler/icons-react'
import { urlFor } from '~/client'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import SourceTag from '~/components/atoms/source_tag'
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
  BulkBar,
  CHECK_CELL,
  FilterSummary,
  MobileSort,
  SelectAllRow,
  TABLE_HEAD_ROW,
  TableEmpty,
} from '~/components/organisms/data_table/table_parts'
import { CancelDialog, StatusDialog } from '~/components/organisms/orders/bulk_order_dialogs'
import AdminLayout from '~/components/templates/admin_layout'
import {
  CANCEL_REASONS,
  PHASE_FILTERS,
  PHASE_LABEL,
  adminOrders,
  cancelable,
  phaseRank,
  statusEligible,
  type AdminOrder,
  type AdminOrderRow,
} from '~/lib/orders/admin_orders'
import { useDataTable, type SortDirection } from '~/lib/shared/data_table'
import { formatDayMonth } from '~/lib/shared/date'
import { formatRupiah } from '~/lib/shared/format'
import { useLiveReload } from '~/lib/shared/live'
import type { StatusTone } from '~/lib/tracking/status'
import { cn } from '~/lib/shared/utils'

type Origin = 'online' | 'toko'

const SORT_OPTIONS = [
  { value: 'date:desc', label: 'Tanggal · terbaru' },
  { value: 'date:asc', label: 'Tanggal · terlama' },
  { value: 'total:desc', label: 'Total · tertinggi' },
  { value: 'total:asc', label: 'Total · terendah' },
  { value: 'name:asc', label: 'Pelanggan · A–Z' },
  { value: 'status:asc', label: 'Status · alur' },
  { value: 'ref:asc', label: 'No. pesanan · A–Z' },
]

export default function AdminOrders({ orders }: { orders: AdminOrderRow[] }) {
  const all = useMemo(() => adminOrders(orders), [orders])
  useLiveReload('admin/orders', ['orders'])
  const [phases, setPhases] = useState<StatusTone[]>([])
  const [origins, setOrigins] = useState<Origin[]>([])
  const [query, setQuery] = useState('')
  const [dialog, setDialog] = useState<'status' | 'cancel' | null>(null)
  const search = query.trim().toLowerCase()

  const matches = (order: AdminOrder, skip?: 'phase' | 'origin') =>
    (skip === 'phase' || !phases.length || phases.includes(order.phase)) &&
    (skip === 'origin' ||
      !origins.length ||
      origins.includes(order.isInStore ? 'toko' : 'online')) &&
    (!search ||
      `${order.number} ${order.customer} ${order.area} ${order.staff}`
        .toLowerCase()
        .includes(search))

  const table = useDataTable<AdminOrder>(
    all.filter((order) => matches(order)),
    [
      { key: 'ref', value: (row) => row.number },
      { key: 'name', value: (row) => row.customer },
      { key: 'area', value: (row) => row.area },
      { key: 'status', value: (row) => phaseRank(row.phase) },
      { key: 'total', value: (row) => row.total, direction: 'desc' },
      { key: 'date', value: (row) => row.date.getTime(), direction: 'desc' },
    ],
    { unit: 'pesanan', sortKey: 'date', sortDirection: 'desc' }
  )
  const selected = table.selectedRows
  const cancellable = cancelable(selected)
  const parts: string[] = []
  if (search) {
    parts.push(`kata kunci “${query.trim()}”`)
  }
  if (phases.length) {
    parts.push(`status: ${phases.map((phase) => PHASE_LABEL[phase]).join(', ')}`)
  }
  if (origins.length) {
    parts.push(
      `asal: ${origins.map((origin) => (origin === 'toko' ? 'Toko' : 'Online')).join(', ')}`
    )
  }

  function changeFilter(change: () => void) {
    change()
    table.resetPage()
  }

  function resetFilters() {
    changeFilter(() => {
      setQuery('')
      setPhases([])
      setOrigins([])
    })
  }

  const exportButton = (size: 'desktop' | 'compact') => (
    <ExportButton
      size={size}
      selectedCount={table.selectedCount}
      ariaLabel={`Unduh Excel — ${table.selectedCount ? `${table.selectedCount} pesanan terpilih` : `${table.total} pesanan sesuai filter`}`}
      build={() => {
        const list = table.selectedCount ? table.selectedRows : table.sorted
        return {
          name: 'pesanan',
          title: 'Pesanan Umima',
          unit: 'pesanan',
          count: list.length,
          sheets: [
            {
              name: 'Pesanan',
              columns: [
                { label: 'No. pesanan', width: 14 },
                { label: 'Pelanggan', width: 22 },
                { label: 'Asal', width: 10 },
                { label: 'Area', width: 14 },
                { label: 'Status', width: 22 },
                { label: 'Total', type: 'rp', width: 13 },
                { label: 'Pembayaran', width: 20 },
                { label: 'Staf', width: 10 },
                { label: 'Tanggal', type: 'date', width: 13 },
              ],
              rows: list.map((row) => [
                row.number,
                row.customer,
                row.isInStore ? 'Toko' : 'Online',
                row.area,
                row.status,
                row.total || null,
                row.payment,
                row.staff,
                row.date,
              ]),
            },
          ],
        }
      }}
    />
  )

  const detailHref = (number: string) => urlFor('admin.order', { number })

  return (
    <AdminLayout active="pesanan" title="Pesanan">
      <Head title="Pesanan" />
      <AdminPageHeader title="Pesanan" actions={exportButton('desktop')} />
      <div className="flex min-w-0 flex-col gap-3 rounded-lg border border-border bg-card px-4 py-3.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <FilterMenu<StatusTone>
            word="Status"
            label="Filter status"
            values={phases}
            onChange={(value) => changeFilter(() => setPhases(value))}
            options={PHASE_FILTERS.map((phase) => ({
              value: phase,
              label: PHASE_LABEL[phase],
              count: all.filter((order) => order.phase === phase && matches(order, 'phase')).length,
            }))}
          />
          <FilterMenu<Origin>
            word="Asal"
            label="Filter asal"
            values={origins}
            onChange={(value) => changeFilter(() => setOrigins(value))}
            options={(['online', 'toko'] as Origin[]).map((origin) => ({
              value: origin,
              label: origin === 'toko' ? 'Toko' : 'Online',
              count: all.filter(
                (order) =>
                  (order.isInStore ? 'toko' : 'online') === origin && matches(order, 'origin')
              ).length,
            }))}
          />
        </div>
        <div className="flex flex-wrap gap-2.5">
          <SearchField
            label="Cari nomor pesanan, nama, area, atau staf"
            placeholder="Cari no. pesanan / nama / area"
            value={query}
            onChange={(value) => changeFilter(() => setQuery(value))}
          />
        </div>
        {parts.length > 0 && (
          <FilterSummary
            text={`${table.total} dari ${all.length} pesanan · ${parts.join(' · ')}`}
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
              onPress={() => setDialog('status')}
              className="text-[13.5px]"
            >
              <IconArrowsExchange className="size-4.5" />
              Ubah status
            </Button>
            <Button
              variant="destructive-outline"
              size="compact"
              isDisabled={!cancellable.length}
              title={
                cancellable.length
                  ? `Batalkan ${cancellable.length} pesanan terpilih`
                  : 'Pesanan selesai atau sudah dibatalkan tidak bisa dibatalkan'
              }
              onPress={() => setDialog('cancel')}
              className="border-destructive-border-soft text-[13.5px]"
            >
              <IconBan className="size-4.5" />
              Batalkan pesanan
            </Button>
            {exportButton('compact')}
          </BulkBar>
        )}
        <MobileSort
          value={`${table.sortKey}:${table.sortDirection}`}
          options={SORT_OPTIONS}
          onChange={(value) => {
            const [key, direction] = value.split(':')
            table.setSort({ key, direction: direction as SortDirection })
          }}
        />
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
                <SortHeader sort={table.ariaSort('ref')} onSort={() => table.sortBy('ref')}>
                  No. pesanan
                </SortHeader>
                <SortHeader sort={table.ariaSort('name')} onSort={() => table.sortBy('name')}>
                  Pelanggan
                </SortHeader>
                <SortHeader
                  sort={table.ariaSort('area')}
                  onSort={() => table.sortBy('area')}
                  className="max-lg:hidden"
                >
                  Area
                </SortHeader>
                <SortHeader sort={table.ariaSort('status')} onSort={() => table.sortBy('status')}>
                  Status
                </SortHeader>
                <SortHeader
                  sort={table.ariaSort('total')}
                  align="right"
                  onSort={() => table.sortBy('total')}
                >
                  Total
                </SortHeader>
                <TableHead>Pembayaran</TableHead>
                <TableHead className="max-lg:hidden">Staf</TableHead>
                <SortHeader
                  sort={table.ariaSort('date')}
                  onSort={() => table.sortBy('date')}
                  className="pr-4.5"
                >
                  Tanggal
                </SortHeader>
              </tr>
            </TableHeader>
            <TableBody>
              {table.rows.map((row) => {
                const isSelected = table.isSelected(row.id)
                return (
                  <TableRow key={row.id} data-selected={isSelected}>
                    <TableCell className={CHECK_CELL}>
                      <Checkbox
                        isSelected={isSelected}
                        onChange={() => table.toggle(row.id)}
                        aria-label={`Pilih ${row.label}`}
                      />
                    </TableCell>
                    <TableCell className="py-1">
                      <Link
                        href={detailHref(row.number)}
                        className="inline-flex min-h-11 items-center font-mono text-meta leading-[1.3] font-semibold text-primary"
                      >
                        {row.number}
                      </Link>
                    </TableCell>
                    <TableCell className="py-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{row.customer}</span>
                        <SourceTag isInStore={row.isInStore} />
                      </div>
                    </TableCell>
                    <TableCell className="py-1 text-foreground-secondary max-lg:hidden">
                      {row.area}
                    </TableCell>
                    <TableCell className="py-1">
                      <ToneBadge tone={row.phase}>{row.status}</ToneBadge>
                    </TableCell>
                    <TableCell className="py-1 text-right tabular-nums">
                      {row.total ? formatRupiah(row.total) : '—'}
                    </TableCell>
                    <TableCell className="py-1 text-foreground-secondary">{row.payment}</TableCell>
                    <TableCell className="py-1 text-foreground-secondary max-lg:hidden">
                      {row.staff}
                    </TableCell>
                    <TableCell className="py-1 pr-4.5 whitespace-nowrap text-foreground-secondary last:pr-4.5">
                      {formatDayMonth(row.date)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
        <ul className="sm:hidden">
          {table.rows.map((row) => {
            const isSelected = table.isSelected(row.id)
            return (
              <li
                key={row.id}
                data-selected={isSelected}
                className={cn(
                  'flex items-start gap-0.5 border-t border-border py-1.5 pr-4 pl-1',
                  isSelected && 'bg-row-selected'
                )}
              >
                <Checkbox
                  isSelected={isSelected}
                  onChange={() => table.toggle(row.id)}
                  aria-label={`Pilih ${row.label}`}
                />
                <Link
                  href={detailHref(row.number)}
                  className="flex min-w-0 flex-1 flex-col gap-1.5 py-2 text-foreground no-underline hover:text-foreground hover:no-underline"
                >
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-meta leading-none font-semibold text-primary">
                      {row.number}
                    </span>
                    <SourceTag isInStore={row.isInStore} />
                    <span className="ml-auto text-[14.5px] leading-none font-semibold">
                      {row.total ? formatRupiah(row.total) : '—'}
                    </span>
                  </span>
                  <span className="text-[15px] leading-[1.3] font-semibold">{row.customer}</span>
                  <span className="flex flex-wrap items-center gap-2">
                    <ToneBadge tone={row.phase}>{row.status}</ToneBadge>
                    <span className="text-meta leading-[1.3] text-muted-foreground">
                      {row.payment} · {formatDayMonth(row.date)}
                    </span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
        {table.total === 0 && (
          <TableEmpty
            title="Tidak ada pesanan yang cocok"
            description="Ubah filter atau kata kunci pencarian."
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
      <StatusDialog
        key={dialog === 'status' ? 'status-open' : 'status'}
        isOpen={dialog === 'status'}
        onOpenChange={(isOpen) => !isOpen && setDialog(null)}
        selected={selected}
        onApply={(target) => {
          const eligible = statusEligible(selected, target)
          if (!eligible.length) {
            return 'Tidak ada pesanan terpilih yang bisa diubah ke status ini.'
          }
          router.post(
            urlFor('admin.orders.move'),
            { codes: eligible.map((order) => order.number), phase: target },
            {
              preserveScroll: true,
              onSuccess: () => {
                setDialog(null)
                table.clear()
              },
            }
          )
          return null
        }}
      />
      <CancelDialog
        key={dialog === 'cancel' ? 'cancel-open' : 'cancel'}
        isOpen={dialog === 'cancel'}
        onOpenChange={(isOpen) => !isOpen && setDialog(null)}
        title={`Batalkan ${cancellable.length} pesanan?`}
        description="Pesanan tidak dihapus — statusnya menjadi Dibatalkan dan tetap ada di riwayat & laporan. Pelanggan dikirimi WhatsApp; hasil pengirimannya ditampilkan setelah disimpan."
        skipped={
          selected.length > cancellable.length
            ? `${selected.length - cancellable.length} pesanan terpilih dilewati karena sudah selesai atau dibatalkan.`
            : undefined
        }
        reasons={CANCEL_REASONS}
        confirmLabel={`Batalkan ${cancellable.length} pesanan`}
        onConfirm={(reason) => {
          router.post(
            urlFor('admin.orders.cancel'),
            { codes: cancellable.map((order) => order.number), reason },
            {
              preserveScroll: true,
              onSuccess: () => {
                setDialog(null)
                table.clear()
              },
            }
          )
        }}
      />
    </AdminLayout>
  )
}
