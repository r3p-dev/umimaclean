import type { ReactNode } from 'react'

export default function StaffTopBar({ title, meta }: { title: string; meta?: ReactNode }) {
  return (
    <header className="flex min-h-15 items-center gap-2 border-b border-border bg-card pr-4 pl-5">
      <h1 className="min-w-0 flex-1 text-xl leading-none font-bold">{title}</h1>
      {meta && <span className="text-right text-sm font-medium text-muted-foreground">{meta}</span>}
    </header>
  )
}
