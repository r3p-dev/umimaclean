export const PHONE_LIMITS = { min: 9, max: 13 } as const

export const PHONE_COUNTRY_CODE = '62'

export type PhoneProblem = 'required' | 'format' | 'prefix' | 'minLength' | 'maxLength'

function compact(value: string) {
  return value
    .trim()
    .replace(/[\s().-]/g, '')
    .replace(/^\+/, '')
}

export function nationalNumber(value: string) {
  return compact(value).replace(/^(62|0)/, '')
}

export function phoneProblem(value: string): PhoneProblem | null {
  const digits = compact(value)
  if (!digits) {
    return 'required'
  }

  if (!/^\d+$/.test(digits)) {
    return 'format'
  }

  const national = nationalNumber(digits)
  if (!national.startsWith('8')) {
    return 'prefix'
  }

  if (national.length < PHONE_LIMITS.min) {
    return 'minLength'
  }

  if (national.length > PHONE_LIMITS.max) {
    return 'maxLength'
  }

  return null
}

export function normalizePhone(value: string) {
  if (phoneProblem(value)) {
    return null
  }

  return PHONE_COUNTRY_CODE + nationalNumber(value)
}

export function maskPhone(phone: string) {
  const national = nationalNumber(phone)
  const groups = [national.slice(0, 3), national.slice(3, 7), national.slice(7)].filter(Boolean)

  return '+62 ' + groups.map((group, index) => (index === 1 ? '••••' : group)).join('-')
}

export function lastFourDigits(phone: string) {
  return phone.slice(-4)
}

export function displayPhone(phone: string) {
  const national = nationalNumber(phone)
  const groups = [national.slice(0, 3), national.slice(3, 7), national.slice(7)].filter(Boolean)

  return '+62 ' + groups.join('-')
}
