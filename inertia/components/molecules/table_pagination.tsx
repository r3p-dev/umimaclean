import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { Button } from '~/components/ui/button'
import { PAGE_SIZES } from '~/lib/shared/data_table'
import { cn } from '~/lib/shared/utils'

export default function TablePagination({
  rangeText,
  page,
  pages,
  pageNumbers,
  size,
  onPage,
  onSize,
}: {
  rangeText: string
  page: number
  pages: number
  pageNumbers: number[]
  size: number
  onPage: (page: number) => void
  onSize: (size: number) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border py-2.5 pr-3.5 pl-4.5 text-meta leading-[1.4] text-muted-foreground">
      <span role="status" className="flex-[1_1_180px]">
        {rangeText}
      </span>
      <label className="flex items-center gap-2 whitespace-nowrap">
        Baris per halaman
        <select
          value={size}
          onChange={(event) => onSize(Number(event.target.value))}
          className="h-btn-compact rounded-md border border-input bg-card px-2 text-base leading-none text-foreground"
        >
          {PAGE_SIZES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <nav aria-label="Halaman tabel" className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          aria-label="Halaman sebelumnya"
          isDisabled={page <= 1}
          onPress={() => onPage(page - 1)}
        >
          <IconChevronLeft />
        </Button>
        {pageNumbers.map((number) => {
          const current = number === page
          return (
            <button
              key={number}
              type="button"
              aria-label={`Halaman ${number}`}
              aria-current={current ? 'page' : undefined}
              onClick={() => onPage(number)}
              className={cn(
                'h-btn-compact min-w-10 rounded-md border px-1.5 text-sm leading-none tabular-nums',
                current
                  ? 'border-foreground bg-surface-inverse font-semibold text-surface-inverse-foreground'
                  : 'border-transparent font-medium text-foreground hover:bg-accent'
              )}
            >
              {number}
            </button>
          )
        })}
        <Button
          variant="outline"
          size="icon"
          aria-label="Halaman berikutnya"
          isDisabled={page >= pages}
          onPress={() => onPage(page + 1)}
        >
          <IconChevronRight />
        </Button>
      </nav>
    </div>
  )
}
