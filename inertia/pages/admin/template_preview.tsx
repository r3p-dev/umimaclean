import type { ReactNode } from 'react'
import { Head } from '@inertiajs/react'
import OwnerPageHeader from '~/components/organisms/owner_page_header'
import OwnerLayout from '~/components/templates/owner_layout'

// Development-only preview of the owner template (routes under /_preview); the owner summary in M10a replaces it.
const METRICS = [
  'Omzet (pendapatan kotor)',
  'Transaksi lunas',
  'Rata-rata per pesanan',
  'Laba bersih',
]

export default function OwnerTemplatePreview() {
  return (
    <>
      <Head title="Pratinjau template owner" />
      <OwnerPageHeader title="Ringkasan" status="Pratinjau template" />
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {METRICS.map((metric) => (
          <li
            key={metric}
            className="flex flex-col gap-1 rounded-xl border border-border bg-card p-5"
          >
            <span className="text-sm font-medium">{metric}</span>
            <span className="text-2xl font-bold">–</span>
          </li>
        ))}
      </ul>
    </>
  )
}

OwnerTemplatePreview.layout = (page: ReactNode) => (
  <OwnerLayout active="ringkasan" title="Ringkasan">
    {page}
  </OwnerLayout>
)
