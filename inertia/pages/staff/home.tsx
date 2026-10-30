import { Head } from '@inertiajs/react'
import {
  IconArchive,
  IconArrowDownLeft,
  IconArrowRight,
  IconArrowUpRight,
  IconCircleCheck,
  IconMapPin,
  IconWashMachine,
} from '@tabler/icons-react'
import { urlFor } from '~/client'
import { LinkButton } from '~/components/ui/button'
import Overline from '~/components/atoms/overline'
import HomeTile from '~/components/molecules/home_tile'
import StaffTopBar from '~/components/organisms/staff_top_bar'
import QueueMap from '~/components/organisms/tasks/queue_map'
import StaffLayout from '~/components/templates/staff_layout'
import { DAY_SHORT, formatDayMonth } from '~/lib/shared/date'
import { greeting } from '~/lib/staff/profile'
import { useAccount } from '~/lib/shared/auth'
import { useLiveReload } from '~/lib/shared/live'
import { useStaffCounts } from '~/lib/staff/summary'
import type { Task, TaskKind } from '~/lib/tasks/queue'
import { useCourierPosition, useDeviceLocation } from '~/lib/tasks/location'
import { cn } from '~/lib/shared/utils'

type NextTask = { kind: TaskKind; isActive: boolean; task: Task; tasks: Task[] }

export default function StaffHome({ next }: { next: NextTask | null }) {
  const account = useAccount()
  const me = useDeviceLocation()
  useCourierPosition(me)
  const counts = useStaffCounts()
  useLiveReload('staff/queues', ['next', 'staffCounts'])
  const today = new Date()

  return (
    <StaffLayout active="beranda">
      <Head title="Beranda" />
      <StaffTopBar
        title="Beranda"
        meta={`${DAY_SHORT[today.getDay()]}, ${formatDayMonth(today, true)}`}
      />
      <div className="mx-auto flex w-full max-w-220 flex-col gap-5 px-4 pt-5 pb-6">
        <div className="px-1">
          <h2 className="text-[clamp(22px,calc(18px+1vw),28px)] leading-[1.2] font-bold tracking-[-0.015em]">
            {greeting(today)}, {account.firstName}
          </h2>
          <p className="mt-1 text-[14.5px] leading-normal text-foreground-secondary">
            Ini yang perlu dikerjakan hari ini.
          </p>
        </div>

        <Overline as="h3" className="-mb-2.5 px-1">
          Tugas berikutnya
        </Overline>
        <div className="grid grid-cols-3 gap-2.5">
          <HomeTile
            href={urlFor('staff.pickups')}
            icon={IconArrowUpRight}
            tone="jemput"
            count={counts.jemput}
            label="Jemput"
            sub="pesanan"
          />
          <HomeTile
            href={urlFor('staff.process')}
            icon={IconWashMachine}
            tone="cuci"
            count={counts.proses}
            label="Proses"
            sub="pesanan"
          />
          <HomeTile
            href={urlFor('staff.deliveries')}
            icon={IconArrowDownLeft}
            tone="antar"
            count={counts.antar}
            label="Antar"
            sub="pesanan"
          />
        </div>

        <section aria-labelledby="active-task" className="flex flex-col gap-2.5">
          <Overline as="h3" id="active-task" className="px-1">
            Tugas aktif
          </Overline>
          {next ? (
            <div className="overflow-hidden rounded-lg border-[1.5px] border-primary bg-card">
              <div className="grid grid-cols-1 sm:grid-cols-2">
                <QueueMap
                  tasks={next.tasks}
                  done={0}
                  me={me.point}
                  label={`Peta antrean ${next.kind === 'jemput' ? 'jemput' : 'antar'}`}
                  showLegend={false}
                  className="min-h-37.5 min-w-0"
                />
                <div className="flex min-w-0 flex-col gap-2.5 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        'inline-flex h-badge items-center gap-1.25 rounded-pill px-2.25 text-xs leading-none font-bold',
                        next.kind === 'jemput'
                          ? 'bg-status-jemput-bg text-status-jemput-fg'
                          : 'bg-success text-success-foreground'
                      )}
                    >
                      {next.kind === 'jemput' ? (
                        <IconArrowUpRight className="size-3.75" />
                      ) : (
                        <IconArrowDownLeft className="size-3.75" />
                      )}
                      {next.kind === 'jemput' ? 'Jemput' : 'Antar'}
                    </span>
                    <span className="text-caption leading-none font-medium text-muted-foreground">
                      {next.isActive ? 'Sedang Anda kerjakan' : 'Urutan #1 dari sistem'}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-lg leading-[1.25] font-bold">{next.task.name}</p>
                      <p className="font-mono text-caption leading-[1.4] text-muted-foreground">
                        {next.task.ref}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xl leading-none font-bold">{next.task.km}</p>
                      <p className="text-caption leading-[1.4] text-muted-foreground">
                        {next.task.legFrom}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 text-note leading-[1.4] text-foreground-secondary">
                    <span className="flex items-center gap-1.25">
                      <IconMapPin className="size-4" />
                      sekitar {next.task.area}
                    </span>
                    <span className="flex items-center gap-1.25">
                      <IconArchive className="size-4" />
                      {next.task.count} barang
                    </span>
                  </div>
                  <LinkButton
                    size="cta"
                    className="mt-1"
                    href={
                      next.isActive
                        ? urlFor(
                            next.kind === 'jemput' ? 'staff.pickup_task' : 'staff.delivery_task'
                          )
                        : urlFor(next.kind === 'jemput' ? 'staff.pickups' : 'staff.deliveries')
                    }
                  >
                    {next.isActive ? 'Lanjutkan Tugas' : 'Buka Antrean'}
                    <IconArrowRight />
                  </LinkButton>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4.5 py-5.5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground">
                <IconCircleCheck className="size-6" />
              </span>
              <div>
                <p className="text-base leading-[1.3] font-semibold">
                  Tidak ada tugas lapangan saat ini
                </p>
                <p className="text-note leading-[1.45] text-foreground-secondary">
                  Cek antrean Proses untuk pekerjaan di toko.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </StaffLayout>
  )
}
