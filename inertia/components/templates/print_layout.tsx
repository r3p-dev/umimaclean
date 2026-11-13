import type { ReactNode } from 'react'
import { Head } from '@inertiajs/react'
import { IconPrinter } from '@tabler/icons-react'
import { Button } from '~/components/ui/button'

// A narrow sheet for the shop's 58 mm receipt printer; the buttons are hidden when printing.
export default function PrintLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center gap-4 bg-background px-4 py-5 print:block print:min-h-0 print:bg-white print:p-0">
      <Head title={title} />
      <div className="flex w-full max-w-80 gap-2 print:hidden">
        <Button size="lg" className="h-11 flex-1" onPress={() => window.print()}>
          <IconPrinter />
          Cetak
        </Button>
      </div>
      <article
        aria-label={title}
        className="flex w-56 flex-col gap-1 border border-border bg-white px-5 py-4 text-xs font-medium text-black print:border-0"
      >
        {children}
      </article>
    </main>
  )
}
