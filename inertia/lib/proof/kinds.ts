export type ProofKind = 'pickup' | 'clean' | 'deliver' | 'intake'

export const PROOF_KINDS: Record<ProofKind, { name: string; hint: string; cta: string }> = {
  pickup: {
    name: 'Penjemputan',
    hint: 'Foto semua barang di lokasi pelanggan sebelum dibawa.',
    cta: 'Ambil Foto Penjemputan',
  },
  clean: {
    name: 'Pencucian',
    hint: 'Foto barang setelah selesai dicuci, sebelum dikemas.',
    cta: 'Ambil Foto Pencucian',
  },
  deliver: {
    name: 'Pengantaran',
    hint: 'Foto barang saat diserahkan ke penerima.',
    cta: 'Ambil Foto Pengantaran',
  },
  intake: {
    name: 'Barang diterima',
    hint: 'Foto kondisi barang saat diterima di toko.',
    cta: 'Ambil Foto Barang',
  },
}

export const MAX_PROOF_PHOTOS = 3

export const PROOF_STEPS = ['Kamera', 'Pratinjau', 'Kirim']

export function isProofKind(value: string | null | undefined): value is ProofKind {
  return value === 'pickup' || value === 'clean' || value === 'deliver' || value === 'intake'
}
