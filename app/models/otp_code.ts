import { OtpCodeSchema } from '#database/schema'
import { scope } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export const OTP_MAX_ATTEMPTS = 5
export const OTP_TTL_MINUTES = 5
export const OTP_RESEND_COOLDOWN_SECONDS = 60
export const OTP_MAX_PHONE_HOURLY = 5
export const OTP_MAX_IP_HOURLY = 20

export default class OtpCode extends OtpCodeSchema {
  static active = scope((query) => {
    query.whereNull('consumed_at').where('expires_at', '>', DateTime.now().toJSDate())
  })
}
