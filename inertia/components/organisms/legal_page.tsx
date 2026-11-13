import type { ReactNode } from 'react'
import SeoHead from '~/components/molecules/seo_head'

export default function LegalPage({
  title,
  description,
  updated,
  children,
}: {
  title: string
  description: string
  updated: string
  children: ReactNode
}) {
  return (
    <article className="mx-auto flex max-w-6xl flex-col gap-6 px-5 pt-10 pb-16">
      <SeoHead title={title} description={description} />
      <header className="flex max-w-prose flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">Terakhir diperbarui {updated}</p>
      </header>
      <div className="flex max-w-prose flex-col gap-6 text-base text-foreground/80">{children}</div>
    </article>
  )
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  )
}

export function LegalList({ children }: { children: ReactNode }) {
  return <ul className="ml-5 flex list-disc flex-col gap-1.5">{children}</ul>
}
