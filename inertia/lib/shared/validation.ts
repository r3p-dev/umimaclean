export const LIMITS = {
  name: { min: 2, max: 80 },
  phone: { min: 9, max: 13 },
  address: { min: 10, max: 300 },
  landmark: 120,
  label: 30,
  note: 300,
  itemsPerKind: 20,
  password: { min: 8, max: 128 },
} as const

export function nameError(value: string) {
  const name = value.trim()
  if (!value) {
    return 'Nama wajib diisi.'
  }
  if (name.length < LIMITS.name.min) {
    return `Nama minimal ${LIMITS.name.min} karakter.`
  }
  if (name.length > LIMITS.name.max) {
    return `Nama maksimal ${LIMITS.name.max} karakter.`
  }
  return null
}

function compactPhone(value: string) {
  return value
    .trim()
    .replace(/[\s().-]/g, '')
    .replace(/^\+/, '')
}

export function nationalPhone(value: string) {
  return compactPhone(value).replace(/^(62|0)/, '')
}

export function phoneError(value: string) {
  const digits = compactPhone(value)
  if (!digits) {
    return 'Nomor WhatsApp wajib diisi.'
  }
  if (!/^\d+$/.test(digits)) {
    return 'Nomor WhatsApp hanya boleh berisi angka.'
  }
  const national = nationalPhone(digits)
  if (!national.startsWith('8')) {
    return 'Nomor diawali 8. Contoh: 812 3456 7890'
  }
  if (national.length < LIMITS.phone.min) {
    return 'Nomor terlalu pendek. Contoh: 812 3456 7890'
  }
  if (national.length > LIMITS.phone.max) {
    return 'Nomor terlalu panjang. Contoh: 812 3456 7890'
  }
  return null
}

export function passwordError(value: string) {
  if (!value) {
    return 'Kata sandi wajib diisi.'
  }
  if (value.length < LIMITS.password.min) {
    return `Kata sandi minimal ${LIMITS.password.min} karakter.`
  }
  if (value.length > LIMITS.password.max) {
    return `Kata sandi maksimal ${LIMITS.password.max} karakter.`
  }
  return null
}

export function addressError(value: string) {
  const address = value.trim()
  if (!value) {
    return 'Alamat wajib diisi.'
  }
  if (address.length < LIMITS.address.min) {
    return 'Lengkapi alamat: nama jalan, nomor rumah, RT/RW.'
  }
  if (address.length > LIMITS.address.max) {
    return `Alamat maksimal ${LIMITS.address.max} karakter.`
  }
  return null
}

export function recipientError(value: string) {
  const name = value.trim()
  if (!value) {
    return 'Nama penerima wajib diisi.'
  }
  if (name.length < LIMITS.name.min) {
    return `Nama penerima minimal ${LIMITS.name.min} karakter.`
  }
  if (name.length > LIMITS.name.max) {
    return `Nama penerima maksimal ${LIMITS.name.max} karakter.`
  }
  return null
}

export function labelError(value: string) {
  const label = value.trim()
  if (!label) {
    return 'Pilih atau isi label alamat.'
  }
  if (label.length > LIMITS.label) {
    return `Label maksimal ${LIMITS.label} karakter.`
  }
  return null
}

export function pickErrors<Field extends string>(
  errors: Record<string, string | undefined>,
  fields: readonly Field[]
) {
  const picked: Partial<Record<Field, string>> = {}
  for (const field of fields) {
    const message = errors[field]
    if (message) {
      picked[field] = message
    }
  }
  return picked
}
