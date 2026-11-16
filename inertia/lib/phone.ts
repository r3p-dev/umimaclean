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

export function extractLocalDigits(value: string): string {
  let digits = value.replace(/\D/g, '')
  if (digits.startsWith('62')) {
    digits = digits.slice(2)
  }
  if (digits.startsWith('0')) {
    digits = digits.slice(1)
  }
  return digits.slice(0, 12)
}

export function formatLocalPhoneInput(value: string): string {
  const digits = extractLocalDigits(value)
  if (digits.length <= 3) {
    return digits
  }
  if (digits.length <= 7) {
    return `${digits.slice(0, 3)} ${digits.slice(3)}`
  }
  if (digits.length <= 11) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`
  }
  return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7, 11)} ${digits.slice(11)}`
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
