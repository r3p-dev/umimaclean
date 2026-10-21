import type { Data } from '@generated/data'

export type TaskKind = 'jemput' | 'antar'

export type Task = Data.Task

export type QueueState = 'current' | 'next' | 'later'

export const TASK_COPY = {
  jemput: {
    noun: 'Penjemputan',
    short: 'Jemput',
    title: 'Jemput',
    itemsTitle: 'Barang yang dijemput',
    itemsSub: 'perkiraan pelanggan',
  },
  antar: {
    noun: 'Pengantaran',
    short: 'Antar',
    title: 'Antar',
    itemsTitle: 'Barang yang diantar',
    itemsSub: 'sesuai pesanan',
  },
} as const

export const TASK_STEPS = ['Menuju Lokasi', 'Tiba', 'Foto Bukti', 'Selesai']

export function itemLineLabel(line: string) {
  const match = line.match(/^(\S+) ×(\d+)$/)
  if (!match) {
    return line
  }
  return `${match[2]} ${match[1] === 'Sepatu' ? 'pasang sepatu' : match[1].toLowerCase()}`
}

export function itemLineIcon(line: string) {
  const word = line.split(' ')[0]
  if (word === 'Sepatu' || word === 'Sneakers') {
    return 'shoe'
  }
  if (word === 'Tas' || word === 'Ransel' || word === 'Tote') {
    return 'bag'
  }
  if (word === 'Helm') {
    return 'helmet'
  }
  return 'other'
}

export type ItemIconKind = ReturnType<typeof itemLineIcon>
