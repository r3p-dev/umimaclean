export function formatPhone(digits: string) {
  return digits.replace(/(\d{3})(\d{0,4})(\d{0,6})/, (_, a, b, c) =>
    [a, b, c].filter(Boolean).join(' ')
  )
}

export function phoneDigits(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/^(62|0)/, '')
    .slice(0, 13)
}

export function displayPhone(digits: string) {
  return '+62 ' + formatPhone(digits).replaceAll(' ', '-')
}

export function maskPhone(digits: string) {
  const parts = formatPhone(digits).split(' ')
  return '+62 ' + parts.map((part, index) => (index === 1 ? '••••' : part)).join('-')
}

export function phoneError(digits: string) {
  if (!digits) return 'Isi nomor WhatsApp Anda.'
  if (!digits.startsWith('8')) return 'Nomor diawali 8. Contoh: 812 3456 7890'
  if (digits.length < 9) return 'Nomor terlalu pendek. Contoh: 812 3456 7890'
  return null
}
