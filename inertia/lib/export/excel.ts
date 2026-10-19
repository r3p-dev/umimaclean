import { toIso } from '~/lib/shared/date'
import { workbookBytes, type Sheet } from '~/lib/export/xlsx'

export type ExportSpec = {
  name: string
  title: string
  unit: string
  count: number
  sheets: Sheet[]
}

export type ExportResult =
  | { status: 'saved'; message: string }
  | { status: 'empty'; message: string }
  | { status: 'failed'; message: string }

const MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

function download(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.rel = 'noopener'
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 5000)
}

export async function exportWorkbook(build: () => ExportSpec): Promise<ExportResult> {
  try {
    const spec = build()
    if (!spec.count) {
      return {
        status: 'empty',
        message: 'Tidak ada data untuk diunduh. Ubah filter terlebih dulu.',
      }
    }
    await new Promise((resolve) => window.setTimeout(resolve, 300))
    const filename = `${spec.name}_${toIso(new Date())}.xlsx`
    const blob = new Blob([workbookBytes(spec.sheets, spec.title)], { type: MIME })
    download(filename, blob)
    return { status: 'saved', message: `${filename} diunduh · ${spec.count} ${spec.unit}.` }
  } catch {
    return { status: 'failed', message: 'Gagal membuat file Excel. Coba lagi.' }
  }
}
