import { useState } from 'react'
import { Head } from '@inertiajs/react'
import { toast } from 'sonner'
import { IconCheck, IconListCheck, IconMessage } from '@tabler/icons-react'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import ExportButton from '~/components/molecules/export_button'
import { SelectMenu } from '~/components/molecules/filter_menu'
import SearchField from '~/components/molecules/search_field'
import SortHeader from '~/components/molecules/sort_header'
import TabList from '~/components/molecules/tab_list'
import TablePagination from '~/components/molecules/table_pagination'
import AdminPageHeader from '~/components/organisms/admin_page_header'
import ReminderDialog from '~/components/organisms/customers/reminder_dialog'
import {
  BulkBar,
  CHECK_CELL,
  FilterSummary,
  MobileSort,
  SelectAllRow,
  TABLE_HEAD_ROW,
  TableEmpty,
} from '~/components/organisms/data_table/table_parts'
import AdminLayout from '~/components/templates/admin_layout'
import {
  CUSTOMERS,
  SEGMENT_TABS,
  THRESHOLDS,
  inSegment,
  markReminded,
  reminders,
  segmentLabel,
  type Customer,
  type Segment,
} from '~/lib/customers/segments'
import { storeSettings } from '~/lib/settings/store_settings'
import { useDataTable, type SortDir } from '~/lib/shared/data_table'
import { formatDayMonth } from '~/lib/shared/date'
import { formatRupiah } from '~/lib/shared/format'
import { cn } from '~/lib/shared/utils'

const SORT_OPTIONS = [
  { value: 'spend:desc', label: 'Total belanja · tertinggi' },
  { value: 'days:desc', label: 'Paling lama tidak aktif' },
  { value: 'last:desc', label: 'Transaksi terakhir · terbaru' },
  { value: 'name:asc', label: 'Nama · A–Z' },
  { value: 'orders:desc', label: 'Total pesanan · terbanyak' },
]

function RemindedBadge() {
  return (
    <span className="ml-1.5 inline-flex h-5.5 items-center gap-1 rounded-pill bg-success px-2 text-[11.5px] leading-none font-semibold text-success-foreground">
      <IconCheck className="size-3.5" />
      Sudah diingatkan
    </span>
  )
}

export default function AdminCustomers() {
  const settings = storeSettings.use()
  const reminded = reminders.use()
  const [segment, setSegment] = useState<Segment>('inactive')
  const [threshold, setThreshold] = useState<number | null>(null)
  const [query, setQuery] = useState('')
  const [remindIds, setRemindIds] = useState<string[] | null>(null)
  const days = threshold ?? settings.inactiveDays
  const search = query.trim().toLowerCase()
  const rows = CUSTOMERS.filter(
    (customer) =>
      inSegment(customer, segment, days) &&
      (!search ||
        `${customer.name} ${customer.area} ${customer.phone}`.toLowerCase().includes(search))
  )
  const table = useDataTable<Customer>(
    rows,
    [
      { key: 'name', value: (row) => row.name },
      { key: 'area', value: (row) => row.area },
      { key: 'last', value: (row) => row.last.getTime(), dir: 'desc' },
      { key: 'days', value: (row) => row.days, dir: 'desc' },
      { key: 'orders', value: (row) => row.orders, dir: 'desc' },
      { key: 'spend', value: (row) => row.spend, dir: 'desc' },
    ],
    { unit: 'pelanggan', sortKey: 'spend', sortDir: 'desc' }
  )
  const tabName = SEGMENT_TABS.find((tab) => tab.key === segment)?.label ?? ''

  function changeFilter(change: () => void) {
    change()
    table.resetPage()
  }

  const exportButton = (size: 'desktop' | 'compact') => (
    <ExportButton
      size={size}
      selectedCount={table.selectedCount}
      ariaLabel={`Unduh Excel — ${table.selectedCount ? `${table.selectedCount} pelanggan terpilih` : `${table.total} pelanggan di tab ini`}`}
      build={() => {
        const list = table.selectedCount ? table.selectedRows : table.sorted
        return {
          name: 'pelanggan',
          title: 'Pelanggan Umima',
          unit: 'pelanggan',
          count: list.length,
          sheets: [
            {
              name: 'Pelanggan',
              columns: [
                { label: 'Pelanggan', width: 22 },
                { label: 'No. HP', width: 16 },
                { label: 'Area', width: 14 },
                { label: 'Transaksi pertama', type: 'date', width: 16 },
                { label: 'Transaksi terakhir', type: 'date', width: 16 },
                { label: 'Hari tidak aktif', type: 'int', width: 14 },
                { label: 'Total pesanan', type: 'int', width: 13 },
                { label: 'Total belanja', type: 'rp', width: 14 },
                { label: 'Segmen', width: 22 },
              ],
              rows: list.map((row) => [
                row.name,
                row.phone,
                row.area,
                row.first,
                row.last,
                row.days,
                row.orders,
                row.spend,
                segmentLabel(row, days),
              ]),
            },
          ],
        }
      }}
    />
  )

  const headers: [string, string, 'left' | 'right', string?][] = [
    ['name', 'Pelanggan', 'left'],
    ['area', 'Area', 'left', 'max-lg:hidden'],
    ['last', 'Transaksi terakhir', 'left'],
    ['days', 'Tidak aktif', 'right'],
    ['orders', 'Total pesanan', 'right', 'max-lg:hidden'],
    ['spend', 'Total belanja', 'right'],
  ]

  return (
    <AdminLayout active="pelanggan" title="Pelanggan">
      <Head title="Pelanggan" />
      <AdminPageHeader title="Pelanggan" actions={exportButton('desktop')} />
      <TabList
        label="Segmen pelanggan"
        idPrefix="tab"
        panelId="cust-panel"
        value={segment}
        onChange={(value) => changeFilter(() => setSegment(value))}
        tabs={SEGMENT_TABS.map((tab) => ({
          value: tab.key,
          label: `${tab.label} · ${CUSTOMERS.filter((customer) => inSegment(customer, tab.key, days)).length}`,
        }))}
      />
      {segment !== 'new' && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-lg border border-border bg-card px-4.5 py-4">
          <IconListCheck className="size-5 text-info-foreground" />
          <p className="flex-[1_1_260px] text-[14.5px] leading-normal">
            <strong className="font-semibold">Definisi:</strong> pelanggan dianggap tidak aktif jika
            tidak ada transaksi lunas selama <strong className="font-semibold">{days} hari</strong>{' '}
            atau lebih (dihitung sampai 8 Okt 2026).
          </p>
          <SelectMenu
            word="Batas"
            label="Batas hari tidak aktif"
            value={days}
            onChange={(value) => changeFilter(() => setThreshold(value))}
            options={THRESHOLDS.map((value) => ({ value, label: `${value} hari` }))}
          />
          <span className="text-caption leading-[1.4] text-muted-foreground">
            Bawaan diatur di Pengaturan
          </span>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2.5">
        <SearchField
          label="Cari nama, area, atau nomor HP"
          placeholder="Cari nama / area / no. HP"
          value={query}
          onChange={(value) => changeFilter(() => setQuery(value))}
        />
      </div>
      {search && (
        <FilterSummary
          text={`${table.total} pelanggan cocok dengan “${query.trim()}” di tab ${tabName}`}
          onReset={() => changeFilter(() => setQuery(''))}
        />
      )}
      <div
        id="cust-panel"
        role="tabpanel"
        aria-labelledby={`tab-${segment}`}
        className="overflow-hidden rounded-lg border border-border bg-card"
      >
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
              onPress={() => setRemindIds(table.selectedRows.map((row) => row.id))}
              className="text-[13.5px]"
            >
              <IconMessage className="size-4.5" />
              Kirim pengingat WhatsApp
            </Button>
            {exportButton('compact')}
          </BulkBar>
        )}
        <MobileSort
          value={`${table.sortKey}:${table.sortDir}`}
          options={SORT_OPTIONS}
          onChange={(value) => {
            const [key, dir] = value.split(':')
            table.setSort({ key, dir: dir as SortDir })
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
                {headers.map(([key, label, align, hide]) => (
                  <SortHeader
                    key={key}
                    sort={table.ariaSort(key)}
                    align={align}
                    onSort={() => table.sortBy(key)}
                    className={hide}
                  >
                    {label}
                  </SortHeader>
                ))}
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
                      <div className="font-semibold">
                        {row.name}
                        {reminded.includes(row.id) && <RemindedBadge />}
                      </div>
                      <div className="font-mono text-caption leading-[1.3] text-muted-foreground">
                        {row.phone}
                      </div>
                    </TableCell>
                    <TableCell className="py-2 text-foreground-secondary max-lg:hidden">
                      {row.area}
                    </TableCell>
                    <TableCell className="py-2">{formatDayMonth(row.last, true)}</TableCell>
                    <TableCell className="py-2 text-right font-semibold tabular-nums">
                      {row.days} hari
                    </TableCell>
                    <TableCell className="py-2 text-right tabular-nums max-lg:hidden">
                      {row.orders}
                    </TableCell>
                    <TableCell className="py-2 text-right tabular-nums">
                      {formatRupiah(row.spend)}
                    </TableCell>
                    <TableCell className="py-2 pr-4.5 text-right last:pr-4.5">
                      <Button
                        variant="outline"
                        size="compact"
                        aria-label={`Kirim WhatsApp ke ${row.name}`}
                        onPress={() => setRemindIds([row.id])}
                        className="gap-1.5 text-meta"
                      >
                        <IconMessage className="size-4" />
                        <span className="max-lg:hidden">WhatsApp</span>
                      </Button>
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
                  'flex items-center gap-0.5 border-t border-border py-1.5 pr-4 pl-1',
                  selected && 'bg-row-selected'
                )}
              >
                <Checkbox
                  isSelected={selected}
                  onChange={() => table.toggle(row.id)}
                  aria-label={`Pilih ${row.label}`}
                />
                <div className="min-w-0 flex-1 py-2">
                  <p className="text-[15px] leading-[1.3] font-semibold">
                    {row.name}
                    {reminded.includes(row.id) && <RemindedBadge />}
                  </p>
                  <p className="text-meta leading-[1.4] text-muted-foreground">
                    {row.days} hari tidak aktif · terakhir {formatDayMonth(row.last, true)}
                  </p>
                  <p className="text-meta leading-[1.4] text-foreground-secondary">
                    {row.orders} pesanan · {formatRupiah(row.spend)} · {row.area}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={`Kirim WhatsApp ke ${row.name}`}
                  onPress={() => setRemindIds([row.id])}
                >
                  <IconMessage />
                </Button>
              </li>
            )
          })}
        </ul>
        {table.total === 0 && (
          <TableEmpty
            title={
              search
                ? `Tidak ada pelanggan yang cocok di tab ${tabName}`
                : 'Tidak ada pelanggan di segmen ini'
            }
            description={
              search
                ? 'Coba tab lain atau ubah kata kunci pencarian.'
                : segment === 'inactive'
                  ? 'Coba batas hari yang lebih pendek.'
                  : 'Coba tab lain.'
            }
            onReset={() => changeFilter(() => setQuery(''))}
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
      <ReminderDialog
        key={remindIds?.join(',') ?? 'closed'}
        count={remindIds?.length ?? 0}
        open={remindIds !== null}
        onOpenChange={(open) => !open && setRemindIds(null)}
        onSend={() => {
          const ids = remindIds ?? []
          markReminded(ids)
          setRemindIds(null)
          if (ids.length > 1) table.clear()
          toast.success(`Pengingat WhatsApp dijadwalkan untuk ${ids.length} pelanggan.`)
        }}
      />
    </AdminLayout>
  )
}
