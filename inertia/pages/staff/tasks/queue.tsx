import { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import { IconCircleCheck, IconLockAccess, IconRoute } from '@tabler/icons-react'
import { urlFor } from '~/client'
import QueueCard from '~/components/molecules/queue_card'
import StaffTopBar from '~/components/organisms/staff_top_bar'
import HandledList from '~/components/organisms/tasks/handled_list'
import QueueMap from '~/components/organisms/tasks/queue_map'
import StaffLayout from '~/components/templates/staff_layout'
import { useLiveReload } from '~/lib/shared/live'
import { useDeviceLocation } from '~/lib/tasks/location'
import { TASK_COPY, type QueueState, type Task, type TaskKind } from '~/lib/tasks/queue'

type Handled = { task: Task; wasSkipped: boolean; reason: string | null; time: string }

export default function TaskQueue({
  kind,
  tasks,
  hasActive,
  handled,
}: {
  kind: TaskKind
  tasks: Task[]
  hasActive: boolean
  handled: Handled[]
}) {
  const me = useDeviceLocation()
  const [isStarting, setStarting] = useState(false)
  const copy = TASK_COPY[kind]
  const taskHref = urlFor(kind === 'jemput' ? 'staff.pickup_task' : 'staff.delivery_task')
  const skipped = handled.filter((entry) => entry.wasSkipped).length
  const subtitle =
    `${tasks.length} tersisa` +
    (kind === 'jemput' ? ` · ${tasks.reduce((sum, task) => sum + task.count, 0)} barang` : '') +
    (skipped ? ` · ${skipped} dilewati` : '')

  useLiveReload('staff/queues', ['tasks', 'hasActive', 'handled'])

  function start(task: Task) {
    router.post(
      urlFor('staff.task.start', { kind, id: task.id }),
      {},
      { onStart: () => setStarting(true), onFinish: () => setStarting(false) }
    )
  }

  return (
    <StaffLayout active={kind}>
      <Head title={copy.title} />
      <StaffTopBar title={copy.title} meta={subtitle} />
      <div className="flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start">
        <div className="flex min-w-0 flex-col gap-2.5 px-4 pt-3.5 pb-5">
          <div className="flex items-start gap-2.5 rounded-md bg-accent px-3.5 py-3 text-note leading-[1.45] text-accent-foreground">
            <IconRoute className="mt-px size-4.75 shrink-0" />
            <span>
              <strong className="font-semibold">Urutan disarankan sistem</strong> ·{' '}
              {kind === 'jemput' ? 'jadwal jemput paling awal dulu' : 'yang paling lama menunggu'}.
            </span>
          </div>
          {tasks.length > 0 && (
            <ol
              aria-label={`Antrean ${copy.title.toLowerCase()}`}
              className="flex flex-col gap-2.5"
            >
              {tasks.map((task, index) => {
                const state: QueueState = index === 0 ? 'current' : index === 1 ? 'next' : 'later'
                return (
                  <QueueCard
                    key={task.ref}
                    task={task}
                    number={index + 1}
                    state={state}
                    href={taskHref}
                    onStart={index === 0 && !hasActive ? () => start(task) : undefined}
                    isStarting={isStarting}
                    lockText={
                      state === 'next'
                        ? 'Terbuka setelah tugas #1 selesai atau dilewati'
                        : 'Menunggu urutan'
                    }
                  />
                )
              })}
            </ol>
          )}
          {tasks.length === 0 && (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground">
                <IconCircleCheck className="size-5.5" />
              </span>
              <p className="flex-1 text-[15px] leading-[1.35] font-semibold">
                Tidak ada tugas {copy.short.toLowerCase()} saat ini.
              </p>
            </div>
          )}
          <HandledList items={handled} />
          <p className="mx-1 mt-1 flex gap-1.5 text-caption leading-[1.45] text-muted-foreground">
            <IconLockAccess className="mt-0.5 size-3.75 shrink-0" />
            Alamat lengkap tampil setelah tugas dimulai. Antrean hanya menampilkan perkiraan area
            dan titik di peta.
          </p>
        </div>
        <QueueMap
          tasks={tasks}
          done={0}
          me={me.point}
          label={`Peta antrean ${copy.title.toLowerCase()}: posisi Anda dan titik tugas`}
          className="h-55 min-w-0 max-lg:order-first lg:h-160"
        />
      </div>
    </StaffLayout>
  )
}
