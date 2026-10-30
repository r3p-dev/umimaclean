import { IconArchive, IconArrowRight, IconLock, IconMapPin } from '@tabler/icons-react'
import { Button, LinkButton } from '~/components/ui/button'
import SourceTag from '~/components/atoms/source_tag'
import type { QueueState, Task } from '~/lib/tasks/queue'
import { cn } from '~/lib/shared/utils'

export default function QueueCard({
  task,
  number,
  state,
  href,
  lockText,
  onStart,
  isStarting = false,
}: {
  task: Task
  number: number
  state: QueueState
  href: string
  lockText: string
  onStart?: () => void
  isStarting?: boolean
}) {
  const isCurrent = state === 'current'

  return (
    <li
      aria-current={isCurrent ? 'step' : undefined}
      className={cn(
        'flex flex-col rounded-lg p-3.5',
        isCurrent ? 'gap-3 border-[1.5px] border-primary bg-card' : 'gap-2 border border-border',
        state === 'next' && 'bg-card',
        state === 'later' && 'bg-background'
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-full text-sm leading-none font-bold',
            isCurrent
              ? 'bg-primary text-surface-inverse-foreground'
              : 'border-[1.5px] border-input bg-card text-foreground-secondary'
          )}
        >
          <span className="sr-only">Urutan </span>
          {number}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-baseline justify-between gap-2.5">
            <span className="flex min-w-0 flex-wrap items-center gap-1.5">
              <span
                className={cn(
                  isCurrent ? 'text-base font-bold' : 'text-md font-semibold',
                  'leading-[1.3]',
                  state === 'later' ? 'text-foreground-secondary' : 'text-foreground'
                )}
              >
                {task.name}
              </span>
              <SourceTag isInStore={task.source === 'toko'} />
              {task.isFresh && (
                <span className="inline-flex h-5.5 items-center rounded-pill bg-success px-2 text-2xs leading-none font-bold text-success-foreground">
                  Baru dari Proses
                </span>
              )}
            </span>
            <span className="flex shrink-0 flex-col items-end">
              <span
                className={cn(
                  isCurrent
                    ? 'text-base font-bold text-info-foreground'
                    : 'text-sm font-semibold text-foreground-secondary',
                  'leading-[1.3]'
                )}
              >
                {task.km}
              </span>
              {task.legFrom && (
                <span className="text-caption leading-[1.4] text-muted-foreground">
                  {task.legFrom}
                </span>
              )}
            </span>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-meta leading-[1.4] text-foreground-secondary">
            <span className="font-mono text-xs leading-normal font-medium">{task.ref}</span>
            <span className="inline-flex items-center gap-1 font-semibold text-foreground">
              <IconArchive className="size-3.75" />
              {task.count} barang
            </span>
            <span>{task.items}</span>
          </div>
          <span className="flex items-center gap-1.25 text-meta leading-[1.4] text-foreground-secondary">
            <IconMapPin className="size-3.75 shrink-0" />
            sekitar {task.area} · {task.slot}
          </span>
        </div>
      </div>
      {isCurrent ? (
        <div className="flex flex-wrap items-center gap-2.5 pl-11">
          <span className="inline-flex h-badge items-center rounded-pill bg-accent px-2.25 text-[11.5px] leading-none font-bold tracking-[0.03em] text-info-foreground uppercase">
            Tugas sekarang
          </span>
          {onStart ? (
            <Button
              className="flex-[1_1_140px] px-0 text-base"
              onPress={onStart}
              isPending={isStarting}
            >
              {isStarting ? 'Memulai…' : 'Mulai Tugas'}
              <IconArrowRight />
            </Button>
          ) : (
            <LinkButton className="flex-[1_1_140px] px-0 text-base" href={href}>
              Lihat Tugas
              <IconArrowRight />
            </LinkButton>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-1.5 pl-11 text-caption leading-[1.3] font-medium text-muted-foreground">
          <IconLock className="size-3.75" />
          {lockText}
        </div>
      )}
    </li>
  )
}
