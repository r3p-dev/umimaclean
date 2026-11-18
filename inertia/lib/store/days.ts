// ISO weekday 1 (Monday) to 7 (Sunday), as the server numbers them (OWN-8, SLOT-1).
export const DAY_NAMES = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

// "2026-11-19T20:00" (a local Asia/Jakarta stamp, D103) → "19 Nov 2026 20.00".
export function formatStamp(stamp: string) {
  const [date, time] = stamp.split('T')
  const [year, month, day] = date.split('-')
  return `${Number(day)} ${MONTHS[Number(month) - 1]} ${year} ${time.replace(':', '.')}`
}
