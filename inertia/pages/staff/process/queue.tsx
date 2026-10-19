import { useState } from 'react'
import { Head } from '@inertiajs/react'
import { IconArrowDownLeft, IconCircleCheck, IconClockShare } from '@tabler/icons-react'
import EmptyState from '~/components/molecules/empty_state'
import TabList from '~/components/molecules/tab_list'
import DemoSwitcher from '~/components/organisms/demo_switcher'
import ProcessRow from '~/components/organisms/processing/process_row'
import StaffTopBar from '~/components/organisms/staff_top_bar'
import StaffLayout from '~/components/templates/staff_layout'
import { PROCESS_GROUPS, processQueue, type ProcessGroupKey } from '~/lib/processing/queue'
import { resetWorkday, useWorkday } from '~/lib/staff/workday'

export default function ProcessQueue() {
  const day = useWorkday()
  const queue = processQueue(day)
  const [tab, setTab] = useState<ProcessGroupKey>('periksa')
  const rows = queue[tab]
  const group = PROCESS_GROUPS[tab]

  return (
    <StaffLayout active="proses">
      <Head title="Proses" />
      <StaffTopBar title="Proses" meta={`${queue.total} pesanan perlu dikerjakan`} />
      <div className="mx-auto flex w-full max-w-260 flex-col gap-3.5 px-4 pt-3.5 pb-6">
        <TabList
          label="Tahap proses"
          idPrefix="proses"
          panelId="proses-panel"
          value={tab}
          onChange={setTab}
          tabs={(Object.keys(PROCESS_GROUPS) as ProcessGroupKey[]).map((key) => ({
            value: key,
            label: `${PROCESS_GROUPS[key].title} · ${queue[key].length}`,
          }))}
        />
        <section
          id="proses-panel"
          role="tabpanel"
          aria-labelledby={`proses-${tab}`}
          className="flex flex-col gap-2"
        >
          <p className="px-1 pt-0.5 text-meta leading-[1.45] text-muted-foreground">{group.hint}</p>
          {rows.length ? (
            <ul className="flex flex-col gap-2">
              {rows.map((row) => (
                <ProcessRow key={row.number} row={row} />
              ))}
            </ul>
          ) : (
            <div className="rounded-lg border border-border bg-card p-5">
              <EmptyState
                icon={IconCircleCheck}
                title={`Tidak ada pesanan di ${group.title}`}
                description="Pesanan baru muncul di sini otomatis."
              />
            </div>
          )}
        </section>
        <div className="flex flex-col gap-2 rounded-md border border-dashed border-input px-3.5 py-3 text-note leading-[1.45] text-foreground-secondary">
          <p className="flex gap-2">
            <IconClockShare className="mt-0.5 size-4.5 shrink-0 text-muted-foreground" />
            {queue.waitText}
          </p>
          <p className="flex gap-2">
            <IconArrowDownLeft className="mt-0.5 size-4.5 shrink-0 text-muted-foreground" />
            Pesanan yang selesai dicuci dan sudah difoto otomatis masuk antrean Antar.
          </p>
        </div>
      </div>
      <DemoSwitcher
        className="max-sm:bottom-19 sm:right-3 sm:left-auto"
        label="Data contoh proses"
        options={[
          { value: 'keep', label: 'Data saat ini' },
          { value: 'reset', label: 'Mulai ulang hari' },
        ]}
        value="keep"
        onChange={(value) => {
          if (value === 'reset') resetWorkday()
        }}
      />
    </StaffLayout>
  )
}
