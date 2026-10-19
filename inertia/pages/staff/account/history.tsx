import { useState, type ComponentType, type SVGProps } from 'react'
import { Head } from '@inertiajs/react'
import {
  IconArrowDownLeft,
  IconArrowForwardUp,
  IconArrowUpRight,
  IconBuildingStore,
  IconFilterOff,
  IconLock,
  IconWashMachine,
} from '@tabler/icons-react'
import { urlFor } from '~/client'
import { Button } from '~/components/ui/button'
import Overline from '~/components/atoms/overline'
import SourceTag from '~/components/atoms/source_tag'
import { FilterMenu } from '~/components/molecules/filter_menu'
import TabList from '~/components/molecules/tab_list'
import StaffTopBar from '~/components/organisms/staff_top_bar'
import StaffLayout from '~/components/templates/staff_layout'
import {
  HISTORY_KINDS,
  HISTORY_PERIODS,
  staffHistory,
  type HistoryIcon,
  type HistoryKind,
  type HistoryPeriod,
} from '~/lib/history/entries'
import { cn } from '~/lib/shared/utils'

const ICONS: Record<HistoryIcon, { icon: ComponentType<SVGProps<SVGSVGElement>>; tone: string }> = {
  jemput: { icon: IconArrowUpRight, tone: 'bg-status-jemput-bg text-status-jemput-fg' },
  antar: { icon: IconArrowDownLeft, tone: 'bg-status-antar-bg text-status-antar-fg' },
  proses: { icon: IconWashMachine, tone: 'bg-status-periksa-bg text-status-periksa-fg' },
  toko: { icon: IconBuildingStore, tone: 'bg-muted text-foreground-secondary' },
  skip: { icon: IconArrowForwardUp, tone: 'bg-attention text-attention-foreground' },
}

function KindIcon({ kind }: { kind: HistoryIcon }) {
  const { icon: Icon, tone } = ICONS[kind]
  return (
    <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-md', tone)}>
      <Icon className="size-5" />
    </span>
  )
}

export default function StaffHistory() {
  const [period, setPeriod] = useState<HistoryPeriod>('today')
  const [kinds, setKinds] = useState<HistoryKind[]>([])
  const history = staffHistory(period, kinds)

  return (
    <StaffLayout active="lainnya">
      <Head title="Riwayat" />
      <StaffTopBar title="Riwayat" back={{ href: urlFor('staff.more'), label: 'Kembali' }} />
      <div className="mx-auto flex w-full max-w-190 flex-col gap-3.5 p-4">
        <TabList
          label="Periode"
          idPrefix="per"
          panelId="riwayat-panel"
          value={period}
          onChange={setPeriod}
          tabs={HISTORY_PERIODS.map((item) => ({
            value: item.key,
            label: `${item.label} · ${history.periodCounts[item.key]}`,
          }))}
        />
        <div
          id="riwayat-panel"
          role="tabpanel"
          aria-labelledby={`per-${period}`}
          className="flex flex-col gap-3.5"
        >
          <div className="flex flex-wrap items-center gap-2.5">
            <FilterMenu
              word="Jenis"
              label="Filter jenis"
              values={kinds}
              onChange={setKinds}
              options={HISTORY_KINDS.map((item) => ({
                value: item.key,
                label: item.label,
                count: history.kindCounts[item.key],
              }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            {history.tiles.map((tile) => (
              <div
                key={tile.key}
                className="flex flex-col gap-1.5 rounded-md border border-border bg-card p-3"
              >
                <KindIcon kind={tile.key} />
                <span className="text-[22px] leading-none font-bold">{tile.count}</span>
                <span className="text-meta leading-[1.2] font-medium text-foreground-secondary">
                  {tile.label}
                </span>
              </div>
            ))}
          </div>
          {history.days.map((group) => (
            <section key={group.day} className="flex flex-col gap-2">
              <Overline as="h2" className="tracking-[0.05em]">
                {group.label}
              </Overline>
              <ul className="overflow-hidden rounded-lg border border-border bg-card">
                {group.entries.map((entry) => (
                  <li
                    key={`${entry.ref}-${entry.time}`}
                    className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 border-t border-border px-4 py-3 first:border-t-0"
                  >
                    <KindIcon kind={entry.icon} />
                    <span className="min-w-0">
                      <span className="block text-[14.5px] leading-[1.3] font-semibold">
                        {entry.title}
                      </span>
                      <span className="block text-meta leading-[1.4] text-foreground-secondary">
                        {entry.who} · <span className="font-mono">{entry.ref}</span>
                      </span>
                      {entry.note && (
                        <span
                          className={cn(
                            'block text-caption leading-[1.4]',
                            entry.icon === 'skip'
                              ? 'text-attention-foreground'
                              : 'text-muted-foreground'
                          )}
                        >
                          {entry.note}
                        </span>
                      )}
                    </span>
                    <span className="flex flex-col items-end gap-1.5">
                      <span className="font-mono text-caption leading-none font-medium text-muted-foreground">
                        {entry.time}
                      </span>
                      <SourceTag store={entry.store} />
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          {history.empty && (
            <div className="rounded-lg border border-border bg-card px-4 py-7 text-center text-sm leading-normal text-foreground-secondary">
              Belum ada catatan {kinds.length ? 'untuk jenis ini di periode ini' : 'di periode ini'}
              .
              {kinds.length > 0 && (
                <div className="mt-2.5">
                  <Button variant="outline" size="compact" onPress={() => setKinds([])}>
                    <IconFilterOff className="size-4.5" />
                    Reset filter jenis
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
        <p className="flex items-start gap-2 text-caption leading-[1.45] text-muted-foreground">
          <IconLock className="size-4 shrink-0" />
          Riwayat hanya-baca. Bila ada catatan yang salah, hubungi owner untuk koreksi — koreksi
          tercatat di log aktivitas.
        </p>
      </div>
    </StaffLayout>
  )
}
