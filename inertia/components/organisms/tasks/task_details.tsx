import { type ComponentType, type SVGProps } from 'react'
import {
  IconArchive,
  IconBackpack,
  IconHelmet,
  IconLockOpen,
  IconMapPinFilled,
  IconMessage,
  IconPhone,
  IconShoe,
} from '@tabler/icons-react'
import { LinkButton } from '~/components/ui/button'
import SourceTag from '~/components/atoms/source_tag'
import {
  TASK_COPY,
  itemLineIcon,
  itemLineLabel,
  type ItemIconKind,
  type Task,
  type TaskKind,
} from '~/lib/tasks/queue'

const ITEM_ICONS: Record<ItemIconKind, ComponentType<SVGProps<SVGSVGElement>>> = {
  shoe: IconShoe,
  bag: IconBackpack,
  helmet: IconHelmet,
  other: IconArchive,
}

export default function TaskDetails({ task, kind }: { task: Task; kind: TaskKind }) {
  const copy = TASK_COPY[kind]

  return (
    <>
      <div className="flex flex-col gap-3 rounded-lg bg-background p-3.5">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-base leading-[1.3] font-bold">{task.full}</span>
            <SourceTag store={task.source === 'toko'} />
          </span>
          <span className="font-mono text-xs leading-[1.4] font-medium text-muted-foreground">
            {task.ref}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <LinkButton
            variant="outline"
            className="h-12.5 gap-1.5 border-border-strong text-[14.5px]"
            href={`tel:+62${task.tel}`}
          >
            <IconPhone className="text-info-foreground" />
            Telepon
          </LinkButton>
          <LinkButton
            variant="outline"
            className="h-12.5 gap-1.5 border-border-strong text-[14.5px]"
            href={`https://wa.me/62${task.tel}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconMessage className="text-info-foreground" />
            Pesan
          </LinkButton>
        </div>
        <div className="flex flex-col gap-1 border-t border-border pt-3">
          <div className="flex gap-2 text-[14.5px] leading-[1.45]">
            <IconMapPinFilled className="mt-0.5 size-5 shrink-0 text-destructive" />
            <span>{task.addr}</span>
          </div>
          <p className="pl-7 text-note leading-[1.4] text-foreground-secondary">
            Patokan: {task.note}
          </p>
          <p className="flex items-center gap-1.5 pl-7 text-xs leading-[1.4] text-muted-foreground">
            <IconLockOpen className="size-3.5" />
            Alamat lengkap terbuka karena tugas ini aktif.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3.5 rounded-lg border border-border px-3.5 py-3">
        <div className="min-w-14 text-center">
          <p className="text-[30px] leading-none font-bold">{task.count}</p>
          <p className="mt-0.5 text-caption leading-[1.3] font-medium text-muted-foreground">
            barang
          </p>
        </div>
        <div className="flex min-w-0 flex-col gap-1.25 border-l border-border pl-3.5">
          <p className="text-sm leading-[1.3] font-semibold">
            {copy.itemsTitle}{' '}
            <span className="font-normal text-muted-foreground">· {copy.itemsSub}</span>
          </p>
          <ul className="flex flex-col gap-1.25">
            {task.lines.map((line) => {
              const Icon = ITEM_ICONS[itemLineIcon(line)]
              return (
                <li key={line} className="flex items-start gap-2 text-sm leading-[1.4]">
                  <Icon className="mt-px size-4.5 shrink-0 text-foreground-secondary" />
                  {itemLineLabel(line)}
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </>
  )
}
