import { type ReactNode } from 'react'
import { Head } from '@inertiajs/react'

export default function LegalPage({
  title,
  updated,
  children,
}: {
  title: string
  updated: string
  children: ReactNode
}) {
  return (
    <>
      <Head title={title} />
      <article className="mx-auto box-content flex max-w-page flex-col gap-5 px-5 pt-8 pb-14">
        <header className="flex max-w-180 flex-col gap-2">
          <h1 className="text-title">{title}</h1>
          <p className="text-meta text-muted-foreground">Terakhir diperbarui {updated}</p>
        </header>
        <div className="flex max-w-180 flex-col gap-5 text-md leading-[1.6] text-foreground-secondary [&_h2]:text-h2 [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5">
          {children}
        </div>
      </article>
    </>
  )
}
