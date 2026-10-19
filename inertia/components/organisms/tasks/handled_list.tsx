import { IconAlertCircle, IconCircleCheck } from '@tabler/icons-react'
import Overline from '~/components/atoms/overline'
import type { Task } from '~/lib/tasks/queue'
import { cn } from '~/lib/shared/utils'

export default function HandledList({
  items,
}: {
  items: { task: Task; skipped: boolean; reason: string | null; time: string }[]
}) {
  if (!items.length) return null

  return (
    <section className="flex flex-col gap-0.5 px-1 pt-2">
      <Overline as="h2" className="pb-1.5 text-xs">
        Sudah ditangani hari ini
      </Overline>
      <ul className="flex flex-col gap-0.5">
        {items.map(({ task, skipped, reason, time }) => (
          <li
            key={task.ref}
            className="grid grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-x-2 gap-y-0.5 py-1.5 text-note leading-[1.3] text-foreground-secondary"
          >
            {skipped ? (
              <IconAlertCircle className="size-4.5 text-attention-foreground" />
            ) : (
              <IconCircleCheck className="size-4.5 text-success-foreground" />
            )}
            <span>
              {task.name} · <span className="font-mono text-xs">{task.ref}</span>
            </span>
            <span className={cn(skipped && 'font-semibold text-attention-foreground')}>{time}</span>
            {reason && (
              <span className="col-[2/-1] text-caption leading-[1.4] text-attention-foreground">
                {reason} · perlu tindak lanjut, admin menjadwalkan ulang
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
