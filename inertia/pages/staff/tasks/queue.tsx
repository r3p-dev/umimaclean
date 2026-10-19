import { Head } from '@inertiajs/react'
import { IconCircleCheck, IconLockAccess, IconRoute } from '@tabler/icons-react'
import { urlFor } from '~/client'
import QueueCard from '~/components/molecules/queue_card'
import DemoSwitcher from '~/components/organisms/demo_switcher'
import StaffTopBar from '~/components/organisms/staff_top_bar'
import HandledList from '~/components/organisms/tasks/handled_list'
import QueueMap from '~/components/organisms/tasks/queue_map'
import StaffLayout from '~/components/templates/staff_layout'
import { resetTasks, useWorkday } from '~/lib/staff/workday'
import { useDeviceLocation } from '~/lib/tasks/location'
import { taskQueue } from '~/lib/tasks/progress'
import { TASK_COPY, type TaskKind } from '~/lib/tasks/queue'

export default function TaskQueue({ kind: rawKind }: { kind: string }) {
  const kind: TaskKind = rawKind === 'antar' ? 'antar' : 'jemput'
  const day = useWorkday()
  const me = useDeviceLocation()
  const queue = taskQueue(day, kind)
  const copy = TASK_COPY[kind]
  const taskHref = urlFor(kind === 'jemput' ? 'staff.pickup_task' : 'staff.delivery_task')

  return (
    <StaffLayout active={kind}>
      <Head title={copy.title} />
      <StaffTopBar title={copy.title} meta={queue.subtitle} />
      <div className="flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start">
        <div className="flex min-w-0 flex-col gap-2.5 px-4 pt-3.5 pb-5">
          <div className="flex items-start gap-2.5 rounded-md bg-accent px-3.5 py-3 text-note leading-[1.45] text-accent-foreground">
            <IconRoute className="mt-px size-4.75 shrink-0" />
            <span>
              <strong className="font-semibold">Urutan disarankan sistem</strong> · dari lokasi
              Anda, terdekat dulu. Selesaikan tugas sekarang untuk membuka tugas berikutnya.
            </span>
          </div>
          {queue.remaining.length > 0 && (
            <ol
              aria-label={`Antrean ${copy.title.toLowerCase()}`}
              className="flex flex-col gap-2.5"
            >
              {queue.remaining.map(({ task, number, state }) => (
                <QueueCard
                  key={task.ref}
                  task={task}
                  number={number}
                  state={state}
                  href={taskHref}
                  lockText={
                    state === 'next'
                      ? `Terbuka setelah tugas #${queue.progress.done + 1} selesai atau dilewati`
                      : 'Menunggu urutan'
                  }
                />
              ))}
            </ol>
          )}
          {queue.allDone && (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground">
                <IconCircleCheck className="size-5.5" />
              </span>
              <p className="flex-1 text-[15px] leading-[1.35] font-semibold">
                Semua tugas hari ini selesai.
              </p>
            </div>
          )}
          <HandledList items={queue.handled} />
          <p className="mx-1 mt-1 flex gap-1.5 text-caption leading-[1.45] text-muted-foreground">
            <IconLockAccess className="mt-0.5 size-3.75 shrink-0" />
            Alamat lengkap baru tampil setelah tugas dibuka. Antrean hanya menampilkan perkiraan
            area dan titik di peta.
          </p>
        </div>
        <QueueMap
          tasks={queue.tasks}
          done={queue.progress.done}
          me={me.point}
          label={`Peta antrean ${copy.title.toLowerCase()}: posisi Anda dan titik tugas`}
          className="h-55 min-w-0 max-lg:order-first lg:h-160"
        />
      </div>
      <DemoSwitcher
        className="max-sm:bottom-19 sm:right-3 sm:left-auto"
        label={`Data contoh ${copy.title.toLowerCase()}`}
        options={[
          { value: 'keep', label: 'Data saat ini' },
          { value: 'reset', label: 'Ulangi antrean' },
        ]}
        value="keep"
        onChange={(value) => {
          if (value === 'reset') resetTasks(kind)
        }}
      />
    </StaffLayout>
  )
}
