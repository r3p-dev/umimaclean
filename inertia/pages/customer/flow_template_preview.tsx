import type { ReactNode } from 'react'
import { Head } from '@inertiajs/react'
import FlowLayout from '~/components/templates/flow_layout'

// Development-only preview of the step-by-step flow template (routes under /_preview); the order form in M5a uses it.
export default function FlowTemplatePreview() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-2 px-5 py-10">
      <Head title="Pratinjau template alur" />
      <h1 className="text-2xl font-bold tracking-tight">Barang & Jadwal</h1>
      <p className="text-sm text-muted-foreground">Langkah 1 dari 2</p>
    </div>
  )
}

FlowTemplatePreview.layout = (page: ReactNode) => (
  <FlowLayout title="Pesan Penjemputan">{page}</FlowLayout>
)
