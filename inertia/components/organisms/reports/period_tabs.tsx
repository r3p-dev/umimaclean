import TabList from '~/components/molecules/tab_list'
import { PERIOD_TABS, type PeriodKey } from '~/lib/reports/period'

export default function PeriodTabs({
  value,
  onChange,
  from,
  to,
  onFrom,
  onTo,
  warning,
  range,
}: {
  value: PeriodKey
  onChange: (value: PeriodKey) => void
  from: string
  to: string
  onFrom: (value: string) => void
  onTo: (value: string) => void
  warning: string
  range: { minIso: string; maxIso: string; text: string }
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <TabList
        label="Periode"
        idPrefix="per"
        panelId="period-panel"
        value={value}
        onChange={onChange}
        tabs={PERIOD_TABS.map((tab) => ({ value: tab.key, label: tab.label }))}
      />
      {value === 'custom' && (
        <div
          role="group"
          aria-label="Rentang tanggal"
          className="flex flex-wrap items-center gap-2"
        >
          {(
            [
              ['Dari', from, onFrom],
              ['Sampai', to, onTo],
            ] as const
          ).map(([label, date, onDate]) => (
            <label
              key={label}
              className="flex items-center gap-1.5 text-[13.5px] leading-none font-medium text-foreground-secondary"
            >
              {label}
              <input
                type="date"
                min={range.minIso}
                max={range.maxIso}
                value={date}
                onChange={(event) => onDate(event.target.value)}
                className="h-btn-desktop rounded-md border border-input bg-card px-2 text-base leading-none text-foreground"
              />
            </label>
          ))}
          <span className="text-caption leading-[1.3] text-muted-foreground">{range.text}</span>
        </div>
      )}
      {warning && (
        <span
          role="alert"
          className="text-meta leading-[1.3] font-medium text-attention-foreground"
        >
          {warning}
        </span>
      )}
    </div>
  )
}
