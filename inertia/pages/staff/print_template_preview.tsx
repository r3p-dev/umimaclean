import type { ReactNode } from 'react'
import PrintLayout from '~/components/templates/print_layout'

// Development-only preview of the print template (routes under /_preview); labels and receipts come in M7.
export default function PrintTemplatePreview() {
  return (
    <>
      <p className="text-center text-sm font-bold">UMIMA CLEAN</p>
      <p className="text-center">Jl. Margacinta No. 132, Bandung</p>
      <hr className="my-1 border-dashed border-black" />
      <p>Pratinjau lembar cetak 58 mm</p>
    </>
  )
}

PrintTemplatePreview.layout = (page: ReactNode) => (
  <PrintLayout title="Pratinjau cetak">{page}</PrintLayout>
)
