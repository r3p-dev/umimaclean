import TabList from '~/components/molecules/tab_list'
import {
  DATA_MAX_ISO,
  DATA_MIN_ISO,
  DATA_RANGE_TEXT,
  PERIOD_TABS,
  type PeriodKey,
} from '~/lib/reports/period'

export default function PeriodTabs({
  value,
  onChange,
  from,
  to,
  onFrom,
  onTo,
  warning,
}: {
  value: PeriodKey
  onChange: (value: PeriodKey) => void
  from: string
  to: string
  onFrom: (value: string) => void
  onTo: (value: string) => void
  warning: string
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
                min={DATA_MIN_ISO}
                max={DATA_MAX_ISO}
                value={date}
                onChange={(event) => onDate(event.target.value)}
                className="h-btn-desktop rounded-md border border-input bg-card px-2 text-base leading-none text-foreground"
              />
            </label>
          ))}
          <span className="text-caption leading-[1.3] text-muted-foreground">
            {DATA_RANGE_TEXT}
          </span>
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
