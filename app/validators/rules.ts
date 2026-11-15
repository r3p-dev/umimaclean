import vine from '@vinejs/vine'

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
  return /^628\d{8,12}$/.test(normalized)
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

export const indonesianPhoneValidationRule = vine.createRule((value, _, field) => {
  if (typeof value !== 'string') {
    return
  }
  const normalized = normalizePhone(value)
  if (!isValidIndonesianPhone(normalized)) {
    field.report('Format nomor WhatsApp tidak valid (contoh: 081234567890).', 'phone', field)
    return
  }
  field.mutate(normalized, field)
})

export const phoneRule = () => vine.string().use(indonesianPhoneValidationRule())

export const passwordRule = () => vine.string().minLength(8).maxLength(32)
