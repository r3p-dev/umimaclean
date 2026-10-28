import { useRef, type ReactNode } from 'react'
import { Head } from '@inertiajs/react'
import { IconArrowLeft, IconPrinter } from '@tabler/icons-react'
import { Button } from '~/components/ui/button'
import { goBack, usePaperLength } from '~/lib/print/sheet'

export default function PrintLayout({
  title,
  backHref,
  children,
}: {
  title: string
  backHref: string
  children: ReactNode
}) {
  const sheet = useRef<HTMLElement>(null)
  usePaperLength(sheet)

  return (
    <main className="flex min-h-dvh flex-col items-center gap-4 bg-background px-4 py-5 print:block print:min-h-0 print:bg-white print:p-0">
      <Head title={title} />
      <div className="flex w-full max-w-80 gap-2 print:hidden">
        <Button variant="outline" size="desktop" onPress={() => goBack(backHref)}>
          <IconArrowLeft />
          Kembali
        </Button>
        <Button size="desktop" className="flex-1" onPress={() => window.print()}>
          <IconPrinter />
          Cetak
        </Button>
      </div>
      <article
        ref={sheet}
        aria-label={title}
        className="flex w-[58mm] flex-col gap-1 border border-border bg-white px-[5mm] py-[4mm] text-[11.5px] leading-[1.3] font-slip font-medium text-black wrap-anywhere print:border-0"
      >
        {children}
      </article>
    </main>
  )
}
