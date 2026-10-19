import { IconMapPinFilled } from '@tabler/icons-react'
import RouteMap from '~/components/organisms/route_map'
import type { PickupPoint } from '~/lib/order/draft'
import type { Task } from '~/lib/tasks/queue'
import { cn } from '~/lib/shared/utils'

export function MapLegend({
  target,
  className,
}: {
  target: 'task' | 'destination'
  className?: string
}) {
  return (
    <div
      className={cn(
        'absolute z-10 flex items-center gap-2.5 rounded-pill bg-surface-glass px-2.5 py-1.5 text-xs leading-none font-semibold',
        className
      )}
    >
      <span className="flex items-center gap-1.25">
        <span className="size-3 rounded-full border-2 border-card bg-primary shadow-[0_0_0_1px_var(--primary)]" />
        Anda
      </span>
      {target === 'task' ? (
        <span className="flex items-center gap-1.25">
          <span className="size-3 rounded-full bg-primary" />
          Tugas sekarang
        </span>
      ) : (
        <span className="flex items-center gap-0.75">
          <IconMapPinFilled className="size-4 text-destructive" />
          Tujuan
        </span>
      )}
    </div>
  )
}

export default function QueueMap({
  tasks,
  done,
  me,
  label,
  legend = true,
  className,
}: {
  tasks: Task[]
  done: number
  me: PickupPoint
  label: string
  legend?: boolean
  className?: string
}) {
  return (
    <RouteMap
      me={me}
      label={label}
      interactive={false}
      className={className}
      pins={tasks.map((task, index) => ({
        point: task.point,
        label: String(index + 1),
        state: index < done ? 'done' : index === done ? 'current' : 'upcoming',
      }))}
    >
      {legend && <MapLegend target="task" className="bottom-2.5 left-2.5" />}
    </RouteMap>
  )
}
