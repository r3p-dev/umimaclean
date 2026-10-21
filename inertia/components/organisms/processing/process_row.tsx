import { Link } from '@adonisjs/inertia/react'
import {
  IconCamera,
  IconCash,
  IconClipboardCheck,
  IconEdit,
  IconLock,
  IconPackage,
} from '@tabler/icons-react'
import { urlFor } from '~/client'
import SourceTag from '~/components/atoms/source_tag'
import type { ProcessAction, ProcessRow as Row } from '~/lib/processing/queue'
import { cn } from '~/lib/shared/utils'

const ACTIONS: Record<ProcessAction, { label: string; icon: typeof IconEdit; isPrimary: boolean }> =
  {
    continue: { label: 'Lanjutkan', icon: IconEdit, isPrimary: true },
    inspect: { label: 'Periksa Barang', icon: IconClipboardCheck, isPrimary: true },
    collect: { label: 'Terima Pembayaran', icon: IconCash, isPrimary: true },
    open: { label: 'Buka', icon: IconCamera, isPrimary: false },
    handover: { label: 'Serahkan', icon: IconPackage, isPrimary: false },
    locked: { label: 'Lihat', icon: IconLock, isPrimary: false },
  }

function target(row: Row) {
  const number = row.number
  if (row.action === 'inspect') {
    return { href: urlFor('staff.inspection.start', { number }), method: 'post' as const }
  }
  if (row.action === 'collect') {
    return { href: urlFor('staff.store_payment', { number }), method: 'get' as const }
  }
  if (row.action === 'open' || row.action === 'handover') {
    return { href: urlFor('staff.washing', { number }), method: 'get' as const }
  }
  return { href: urlFor('staff.inspection', { number }), method: 'get' as const }
}

export default function ProcessRow({ row }: { row: Row }) {
  const action = ACTIONS[row.action]
  const Icon = action.icon
  const link = target(row)

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2.5 rounded-lg border border-border bg-card px-4 py-3.5">
      <div className="flex min-w-0 flex-[1_1_220px] flex-col gap-0.75">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[15px] leading-[1.3] font-semibold">{row.name}</span>
          <SourceTag isInStore={row.source === 'toko'} />
        </div>
        <span className="font-mono text-xs leading-normal font-medium text-muted-foreground">
          {row.number} · {row.items}
        </span>
      </div>
      <p className="min-w-0 flex-[1_1_180px] text-note leading-[1.45] text-foreground-secondary">
        {row.meta}
      </p>
      <Link
        href={link.href}
        method={link.method}
        as={link.method === 'post' ? 'button' : 'a'}
        aria-label={`${action.label} ${row.number}`}
        className={cn(
          'flex h-11 shrink-0 items-center gap-1.5 rounded-md px-3.5 text-sm leading-none font-semibold no-underline hover:no-underline',
          action.isPrimary
            ? 'bg-primary text-surface-inverse-foreground hover:bg-primary-hover hover:text-surface-inverse-foreground'
            : 'box-content border-[1.5px] border-input bg-card text-info-foreground hover:border-primary hover:bg-accent hover:text-info-foreground'
        )}
      >
        <Icon className="size-4.5" />
        {action.label}
      </Link>
    </li>
  )
}
