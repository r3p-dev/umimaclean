import { type ReactNode } from 'react'

export default function AdminPageHeader({
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
      <div className={status ? 'flex-[1_1_260px]' : 'flex-1'}>
        <h1 className="text-h1 max-sm:sr-only">{title}</h1>
        {status && (
          <p role="status" className="mt-0.5 text-sm leading-[1.4] text-muted-foreground">
            {status}
          </p>
        )}
      </div>
      {actions && <div className="ml-auto flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}
