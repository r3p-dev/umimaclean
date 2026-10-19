import { readStore, writeStore } from '~/lib/shared/storage'

export const OTP_LENGTH = 6
export const OTP_ATTEMPTS = 3
export const RESEND_SECONDS = 60
export const DEMO_OTP = '123456'

const DEVICE_KEY = 'umima:verified-device'
const REMEMBER_DAYS = 30

type VerifiedDevice = { phone: string; until: number }

export function verifiedPhone() {
  const device = readStore<VerifiedDevice>('local', DEVICE_KEY)
  return device && device.until > Date.now() ? device.phone : null
}

export function rememberDevice(phone: string) {
  writeStore('local', DEVICE_KEY, {
    phone,
    until: Date.now() + REMEMBER_DAYS * 24 * 60 * 60 * 1000,
  })
}

export function forgetDevice() {
  writeStore('local', DEVICE_KEY, null)
}

export async function sendCode(phone: string) {
  await new Promise((resolve) => window.setTimeout(resolve, 400))
  return phone.length > 0
}

export async function verifyCode(_phone: string, code: string) {
  await new Promise((resolve) => window.setTimeout(resolve, 500))
  return code === DEMO_OTP
}
