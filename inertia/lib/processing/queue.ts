import type { Data } from '@generated/data'

export type ProcessRow = Data.ProcessRow

export type ProcessAction = ProcessRow['action']

export type ProcessGroupKey = 'periksa' | 'cuci'

export const PROCESS_GROUPS: Record<ProcessGroupKey, { title: string; hint: string }> = {
  periksa: { title: 'Periksa Barang', hint: 'Periksa kondisi, tentukan layanan & harga' },
  cuci: { title: 'Dalam Pencucian', hint: 'Foto hasil cuci → otomatis masuk Antar' },
}
