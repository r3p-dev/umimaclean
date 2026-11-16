export function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.startsWith('0')) {
    return '62' + digits.slice(1)
  }
  if (digits.startsWith('62')) {
    return digits
  }
  if (digits.startsWith('8')) {
    return '62' + digits
  }
  return digits
}

export function isValidIndonesianPhone(phone: string): boolean {
  const normalized = normalizePhone(phone)
  return /^628\d{8,11}$/.test(normalized)
}

export function maskPhone(phone: string): string {
  const normalized = normalizePhone(phone)
  if (normalized.length < 8) {
    return normalized
  }
  const start = normalized.slice(0, 5)
  const end = normalized.slice(-4)
  return `${start}****${end}`
}

export function formatPhone(phone: string): string {
  const normalized = normalizePhone(phone)
  if (!normalized.startsWith('628')) {
    return phone
  }
  const local = normalized.slice(2)
  if (local.length <= 3) {
    return `+62 ${local}`
  }
  if (local.length <= 7) {
    return `+62 ${local.slice(0, 3)} ${local.slice(3)}`
  }
  if (local.length <= 11) {
    return `+62 ${local.slice(0, 3)} ${local.slice(3, 7)} ${local.slice(7)}`
  }
  return `+62 ${local.slice(0, 3)} ${local.slice(3, 7)} ${local.slice(7, 11)} ${local.slice(11)}`
}
