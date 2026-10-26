import type { OtpPurpose } from '#enums/otp_enum'
import type { HttpContext } from '@adonisjs/core/http'

export type Session = HttpContext['session']

export type OtpIssueResult =
  { status: 'sent' } | { status: 'failed' } | { status: 'cooldown' | 'limited'; retryIn: number }

export type OtpCheckResult = 'valid' | 'invalid' | 'locked'

export type PasswordResetGrant = { userId: number; phone: string; expiresAt: string }

export type OtpFlow = {
  purpose: OtpPurpose
  phone: string
  failures: number
  name?: string
  passwordHash?: string
  userId?: number
}
