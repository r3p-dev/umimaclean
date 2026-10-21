import { type ReactNode } from 'react'
import { Checkbox } from '~/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import SortHeader from '~/components/molecules/sort_header'
import {
  BulkBar,
  CHECK_CELL,
  MobileSort,
  SelectAllRow,
  TABLE_HEAD_ROW,
} from '~/components/organisms/data_table/table_parts'
import type { DataTable } from '~/lib/shared/data_table'
import type { ServiceRank, ServiceRow } from '~/lib/reports/services'
import { cn } from '~/lib/shared/utils'

export default function TopServices({
  table,
  rank,
  onRank,
  footer,
  exportButton,
}: {
  table: DataTable<ServiceRow>
  rank: ServiceRank
  onRank: (rank: ServiceRank, shouldToggle: boolean) => void
  footer: string
  exportButton: ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3.5">
        <h2 className="flex-1 text-base leading-none font-semibold whitespace-nowrap">
          Layanan terpopuler
        </h2>
      </div>
      {table.selectedCount > 0 && (
        <BulkBar
          label="Aksi untuk layanan terpilih"
          count={table.selectedCount}
          total={table.total}
          canSelectAll={table.canSelectAll}
          onSelectAll={table.selectAll}
          onClear={table.clear}
        >
          {exportButton}
        </BulkBar>
      )}
      <MobileSort
        value={`${rank}:desc`}
        options={[
          { value: 'items:desc', label: 'Jumlah barang · terbanyak' },
          { value: 'revenue:desc', label: 'Omzet · tertinggi' },
        ]}
        onChange={(value) => onRank(value.split(':')[0] as ServiceRank, false)}
      />
      {table.total > 0 && <SelectAllRow state={table.allState} onToggle={table.toggleAll} />}
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
            <TableHead>Layanan</TableHead>
            <TableHead className="max-lg:hidden">Kategori</TableHead>
            <SortHeader
              sort={table.ariaSort('items')}
              align="right"
              onSort={() => onRank('items', rank === 'items')}
            >
              Barang
            </SortHeader>
            <TableHead className="w-[34%]">Porsi barang</TableHead>
            <SortHeader
              sort={table.ariaSort('revenue')}
              align="right"
              onSort={() => onRank('revenue', rank === 'revenue')}
              className="pr-5"
            >
              Omzet
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
                <TableCell className="py-2 font-semibold">{row.name}</TableCell>
                <TableCell className="py-2 text-foreground-secondary max-lg:hidden">
                  {row.category}
                </TableCell>
                <TableCell className="py-2 text-right tabular-nums">{row.items}</TableCell>
                <TableCell className="py-2">
                  <div className="flex items-center gap-2.5">
                    <div className="h-2 flex-1 overflow-hidden rounded-xs bg-secondary">
                      <div
                        className="h-full rounded-xs bg-primary"
                        style={{ width: `${row.bar}%` }}
                      />
                    </div>
                    <span className="w-9 text-right text-caption leading-none font-medium text-foreground-secondary">
                      {row.share}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-2 pr-5 text-right tabular-nums last:pr-5">
                  {row.revenueText}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      <ul className="sm:hidden">
        {table.rows.map((row) => {
          const isSelected = table.isSelected(row.id)
          return (
            <li
              key={row.id}
              data-selected={isSelected}
              className={cn(
                'flex items-center gap-0.5 border-t border-border py-1 pr-4 pl-1',
                isSelected && 'bg-row-selected'
              )}
            >
              <Checkbox
                isSelected={isSelected}
                onChange={() => table.toggle(row.id)}
                aria-label={`Pilih ${row.label}`}
              />
              <div className="flex min-w-0 flex-1 flex-col gap-2 py-2.5">
                <div className="flex justify-between gap-2.5 text-sm leading-[1.3]">
                  <span>
                    <strong className="font-semibold">{row.name}</strong> · {row.category}
                  </span>
                  <span className="tabular-nums">{row.revenueText}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-xs bg-secondary">
                    <div
                      className="h-full rounded-xs bg-primary"
                      style={{ width: `${row.bar}%` }}
                    />
                  </div>
                  <span className="text-caption leading-none font-medium text-foreground-secondary">
                    {row.items} barang
                  </span>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
      <p className="border-t border-border px-5 py-2.5 text-meta leading-[1.4] text-muted-foreground">
        {footer}
      </p>
    </section>
  )
}
