export function formatRupiah(amount: number) {
  return 'Rp' + amount.toLocaleString('id-ID')
}

export function formatDuration(totalSeconds: number) {
  const seconds = Math.max(0, totalSeconds)
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}
