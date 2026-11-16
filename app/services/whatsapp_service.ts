import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
import { normalizePhone } from '#helpers/phone'

export interface SendMessageResult {
  sent: boolean
  phone: string
  reason: 'delivered' | 'logged_not_in_allowlist'
}

export default class WhatsAppService {
  isPhoneAllowed(phone: string): boolean {
    const isProduction = env.get('NODE_ENV') === 'production'
    if (isProduction) {
      return true
    }

    const rawAllowed = env.get('WHATSAPP_ALLOWED_PHONES')
    if (!rawAllowed) {
      return false
    }

    const allowed = rawAllowed
      .split(',')
      .map((p) => normalizePhone(p.trim()))
      .filter(Boolean)

    const normalizedRecipient = normalizePhone(phone)
    return allowed.includes(normalizedRecipient)
  }

  async sendMessage(phone: string, text: string): Promise<SendMessageResult> {
    const normalized = normalizePhone(phone)

    if (!this.isPhoneAllowed(normalized)) {
      logger.info({ phone: normalized, text }, 'WhatsApp message logged (outside allowed list)')
      return {
        sent: false,
        phone: normalized,
        reason: 'logged_not_in_allowlist',
      }
    }

    logger.info({ phone: normalized, text }, 'WhatsApp message dispatched')
    return {
      sent: true,
      phone: normalized,
      reason: 'delivered',
    }
  }
}
