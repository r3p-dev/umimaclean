import type { ReactNode } from 'react'

export default function SettingsPanel({
  title,
  aside,
  children,
}: {
  title: string
  aside?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="flex min-w-0 flex-col gap-3 rounded-lg border border-border bg-card px-4.5 py-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <h2 className="flex-1 text-[17px] leading-tight font-bold">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  )
}
