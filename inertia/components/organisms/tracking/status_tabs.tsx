import { cn } from '~/lib/shared/utils'

export type StatusTab = 'riwayat' | 'rincian'

const TABS: { key: StatusTab; label: string }[] = [
  { key: 'riwayat', label: 'Riwayat status' },
  { key: 'rincian', label: 'Rincian & biaya' },
]

export default function StatusTabs({
  value,
  onChange,
}: {
  value: StatusTab
  onChange: (tab: StatusTab) => void
}) {
  return (
    <div
      role="tablist"
      aria-label="Isi halaman"
      className="grid grid-cols-2 gap-1 border-b border-border lg:hidden"
    >
      {TABS.map((tab) => {
        const active = tab.key === value
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            id={`tab-${tab.key}`}
            aria-selected={active}
            aria-controls={`panel-${tab.key}`}
            onClick={() => onChange(tab.key)}
            className={cn(
              '-mb-px h-btn-desktop rounded-t-md border-b-2 px-3 text-sm leading-none',
              active
                ? 'border-primary font-semibold text-foreground'
                : 'border-transparent font-medium text-foreground-secondary'
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
