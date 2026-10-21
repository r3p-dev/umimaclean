import { useMemo, useState, type ComponentType, type SVGProps } from 'react'
import { Head } from '@inertiajs/react'
import {
  IconArchive,
  IconArrowsExchange,
  IconCamera,
  IconCash,
  IconChevronLeft,
  IconChevronRight,
  IconClipboardCheck,
  IconFlag,
  IconLogin,
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
  SelectAllRow,
  TABLE_HEAD_ROW,
  TableEmpty,
} from '~/components/organisms/data_table/table_parts'
import AdminLayout from '~/components/templates/admin_layout'
import {
  ACTIVITY_CATEGORIES,
  ACTIVITY_FIRST_DAY,
  ACTIVITY_LAST_DAY,
  activitiesOf,
  activityDate,
  activityStaff,
  type ActivityRow,
  activityMatches,
  activitySummary,
  type Activity,
  type ActivityCategory,
  type ActivityFilters,
  type ActivityIcon,
} from '~/lib/activity/log'
import { useDataTable } from '~/lib/shared/data_table'
import { daysFromToday, fromIso, toIso } from '~/lib/shared/date'
import { cn } from '~/lib/shared/utils'

const ICONS: Record<ActivityIcon, ComponentType<SVGProps<SVGSVGElement>>> = {
  fact_check: IconClipboardCheck,
  flag: IconFlag,
  inventory_2: IconArchive,
  login: IconLogin,
  payments: IconCash,
  photo_camera: IconCamera,
  sync_alt: IconArrowsExchange,
}

function SensitiveTag() {
  return (
    <span className="ml-1.5 inline-flex h-5 items-center rounded-pill bg-destructive-subtle px-1.75 align-[1px] text-2xs leading-none font-bold tracking-[0.03em] text-destructive-text">
      SENSITIF
    </span>
  )
}

function ActionIcon({ activity }: { activity: Activity }) {
  const Icon = ICONS[activity.icon]
  return (
    <Icon
      className={cn(
        'size-4.5 shrink-0',
        activity.isSensitive ? 'text-destructive-text' : 'text-foreground-secondary'
      )}
    />
  )
}

export default function AdminActivity({ activities }: { activities: ActivityRow[] }) {
  const ACTIVITIES = useMemo(() => activitiesOf(activities), [activities])
  const ACTIVITY_STAFF = activityStaff(ACTIVITIES)
  const [filters, setFilters] = useState<ActivityFilters>({
    day: ACTIVITY_LAST_DAY,
    staff: [],
    categories: [],
    isSensitiveOnly: false,
    query: '',
  })
  const rows = ACTIVITIES.filter((activity) => activityMatches(activity, filters))
  const table = useDataTable<Activity>(
    rows,
    [
      { key: 'time', value: (row) => row.time, direction: 'desc' },
      { key: 'staff', value: (row) => row.staff },
      { key: 'action', value: (row) => row.action },
    ],
    { unit: 'aktivitas', sortKey: 'time', sortDirection: 'desc' }
  )
  const date = activityDate(filters.day)
  const parts = activitySummary(filters)
  const dayTotal = ACTIVITIES.filter((activity) => activity.day === filters.day).length

  function update(patch: Partial<ActivityFilters>) {
    setFilters((current) => ({ ...current, ...patch }))
    table.resetPage()
  }

  const exportButton = (size: 'desktop' | 'compact') => (
    <ExportButton
      size={size}
      selectedCount={table.selectedCount}
      ariaLabel={`Unduh Excel — ${table.selectedCount ? `${table.selectedCount} aktivitas terpilih` : `${table.total} aktivitas sesuai filter`}`}
      build={() => {
        const list = table.selectedCount ? table.selectedRows : table.sorted
        return {
          name: 'aktivitas-staf',
          title: 'Aktivitas staf Umima',
          unit: 'aktivitas',
          count: list.length,
          sheets: [
            {
              name: 'Aktivitas staf',
              columns: [
                { label: 'Tanggal', type: 'date', width: 13 },
                { label: 'Waktu', width: 8 },
                { label: 'Staf', width: 18 },
                { label: 'Aksi', width: 34 },
                { label: 'Objek', width: 14 },
                { label: 'Detail', width: 46 },
                { label: 'Sensitif', width: 9 },
              ],
              rows: list.map((row) => [
                fromIso(row.date),
                row.time,
                row.staff,
                row.action,
                row.ref,
                row.detail,
                row.isSensitive ? 'Ya' : 'Tidak',
              ]),
            },
          ],
        }
      }}
    />
  )

  return (
    <AdminLayout active="aktivitas" title="Aktivitas Staf">
      <Head title="Aktivitas Staf" />
      <AdminPageHeader title="Aktivitas Staf" actions={exportButton('desktop')} />
      <div className="flex min-w-0 flex-col gap-3 rounded-lg border border-border bg-card px-4 py-3.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <div role="group" aria-label="Tanggal" className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              aria-label="Hari sebelumnya"
              isDisabled={filters.day <= ACTIVITY_FIRST_DAY}
              onPress={() => update({ day: Math.max(ACTIVITY_FIRST_DAY, filters.day - 1) })}
            >
              <IconChevronLeft />
            </Button>
            <input
              type="date"
              aria-label="Pilih tanggal aktivitas"
              min={toIso(activityDate(ACTIVITY_FIRST_DAY))}
              max={toIso(activityDate(ACTIVITY_LAST_DAY))}
              value={toIso(date)}
              onChange={(event) => {
                if (!event.target.value) {
                  return
                }
                const day = daysFromToday(event.target.value)
                if (day >= ACTIVITY_FIRST_DAY && day <= ACTIVITY_LAST_DAY) {
                  update({ day })
                }
              }}
              className="h-btn-desktop rounded-md border border-input bg-card px-2.5 text-base leading-none text-foreground"
            />
            <Button
              variant="outline"
              size="icon"
              aria-label="Hari berikutnya"
              isDisabled={filters.day >= ACTIVITY_LAST_DAY}
              onPress={() => update({ day: Math.min(ACTIVITY_LAST_DAY, filters.day + 1) })}
            >
              <IconChevronRight />
            </Button>
          </div>
          <FilterMenu
            word="Staf"
            label="Filter staf"
            values={filters.staff}
            onChange={(staff) => update({ staff })}
            options={ACTIVITY_STAFF.map((name) => ({
              value: name,
              label: name,
              count: ACTIVITIES.filter(
                (activity) => activity.staff === name && activityMatches(activity, filters, 'staff')
              ).length,
            }))}
          />
          <FilterMenu<ActivityCategory>
            word="Aksi"
            label="Filter jenis aksi"
            values={filters.categories}
            onChange={(categories) => update({ categories })}
            options={ACTIVITY_CATEGORIES.map((item) => ({
              ...item,
              count: ACTIVITIES.filter(
                (activity) =>
                  activity.category === item.value &&
                  activityMatches(activity, filters, 'categories')
              ).length,
            }))}
          />
          <Switch
            isSelected={filters.isSensitiveOnly}
            onChange={(isSensitiveOnly) => update({ isSensitiveOnly })}
            className="min-h-icon-btn cursor-pointer gap-2.5"
          >
            <span className="text-sm leading-[1.25] font-medium">Hanya aksi sensitif</span>
          </Switch>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <SearchField
            label="Cari nomor pesanan, staf, atau detail"
            placeholder="Cari no. pesanan / staf / detail"
            value={filters.query}
            onChange={(query) => update({ query })}
          />
        </div>
        {parts.length > 0 && (
          <FilterSummary
            text={`${table.total} dari ${dayTotal} aktivitas · ${parts.join(' · ')}`}
            onReset={() => update({ query: '', staff: [], categories: [], isSensitiveOnly: false })}
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
                <SortHeader sort={table.ariaSort('time')} onSort={() => table.sortBy('time')}>
                  Waktu
                </SortHeader>
                <SortHeader sort={table.ariaSort('staff')} onSort={() => table.sortBy('staff')}>
                  Staf
                </SortHeader>
                <SortHeader sort={table.ariaSort('action')} onSort={() => table.sortBy('action')}>
                  Aksi
                </SortHeader>
                <TableHead>Objek</TableHead>
                <TableHead className="pr-4.5 max-lg:hidden last:pr-4.5">Detail</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {table.rows.map((row) => {
                const isSelected = table.isSelected(row.id)
                return (
                  <TableRow
                    key={row.id}
                    data-selected={isSelected}
                    className={cn(row.isSensitive && !isSelected && 'bg-destructive-surface')}
                  >
                    <TableCell className={CHECK_CELL}>
                      <Checkbox
                        isSelected={isSelected}
                        onChange={() => table.toggle(row.id)}
                        aria-label={`Pilih ${row.label}`}
                      />
                    </TableCell>
                    <TableCell className="py-2 font-mono text-meta leading-none font-medium">
                      {row.time}
                    </TableCell>
                    <TableCell className="py-2 font-semibold">{row.staff}</TableCell>
                    <TableCell className="py-2">
                      <div className="flex items-start gap-1.5">
                        <ActionIcon activity={row} />
                        <div>
                          <div>
                            {row.action}
                            {row.isSensitive && <SensitiveTag />}
                          </div>
                          <div className="mt-0.5 text-caption text-muted-foreground lg:hidden">
                            {row.detail}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2 font-mono text-meta leading-none font-medium whitespace-nowrap">
                      {row.ref}
                    </TableCell>
                    <TableCell className="py-2 pr-4.5 text-foreground-secondary max-lg:hidden last:pr-4.5">
                      {row.detail}
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
                  'flex items-start gap-0.5 border-t border-border py-1 pr-4 pl-1',
                  isSelected ? 'bg-row-selected' : row.isSensitive && 'bg-destructive-surface'
                )}
              >
                <Checkbox
                  isSelected={isSelected}
                  onChange={() => table.toggle(row.id)}
                  aria-label={`Pilih ${row.label}`}
                />
                <div className="grid min-w-0 flex-1 grid-cols-[22px_minmax(0,1fr)] gap-x-2.5 gap-y-1 py-2.5">
                  <ActionIcon activity={row} />
                  <div className="flex justify-between gap-2">
                    <span className="text-sm leading-[1.35] font-semibold">
                      {row.action}
                      {row.isSensitive && <SensitiveTag />}
                    </span>
                    <span className="font-mono text-caption leading-[1.35] font-medium text-muted-foreground">
                      {row.time}
                    </span>
                  </div>
                  <span />
                  <span className="text-meta leading-[1.4] text-foreground-secondary">
                    {row.staff} · <span className="font-mono">{row.ref}</span>
                  </span>
                  <span />
                  <span className="text-meta leading-[1.4] text-muted-foreground">
                    {row.detail}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
        {table.total === 0 && (
          <TableEmpty
            title="Tidak ada aktivitas yang cocok"
            description="Ubah tanggal, filter staf/aksi, atau kata kunci."
            onReset={() => update({ query: '', staff: [], categories: [], isSensitiveOnly: false })}
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
    </AdminLayout>
  )
}
