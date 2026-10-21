import { DateTime } from 'luxon'
import { scope } from '@adonisjs/lucid/orm'
import { OtpCodeSchema } from '#database/schema'

export const OTP_MAX_ATTEMPTS = 5

export default class OtpCode extends OtpCodeSchema {
  static active = scope((query) => {
    query.whereNull('consumed_at').where('expires_at', '>', DateTime.now().toJSDate())
  })
}
