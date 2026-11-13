import type { ReactNode } from 'react'

export default function OwnerPageHeader({
  title,
  status,
  actions,
}: {
  title: string
  status?: string
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="flex-1">
        <h1 className="text-2xl font-bold tracking-tight max-sm:sr-only">{title}</h1>
        {status && <p className="mt-0.5 text-sm text-muted-foreground">{status}</p>}
      </div>
      {actions && <div className="ml-auto flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}
