import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
import { maskPhone, normalizePhone } from '#helpers/phone'

export interface SendMessageResult {
  sent: boolean
  phone: string
  reason:
    | 'delivered'
    | 'logged_not_in_allowlist'
    | 'no_token_production'
    | 'fonnte_rejected'
    | 'network_error'
}

// What a message is, for the log line written instead of its text outside development.
export type MessageKind = 'otp' | 'order_received'

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

  async sendMessage(
    phone: string,
    text: string,
    kind: MessageKind = 'otp'
  ): Promise<SendMessageResult> {
    const normalized = normalizePhone(phone)
    const masked = maskPhone(normalized)
    const isDevelopment = env.get('NODE_ENV') === 'development'

    if (!this.isPhoneAllowed(normalized)) {
      if (isDevelopment) {
        logger.info({ phone: masked, text }, 'WhatsApp message logged (outside allowed list)')
      } else {
        logger.info({ phone: masked, kind }, 'WhatsApp message logged (outside allowed list)')
      }
      return {
        sent: false,
        phone: normalized,
        reason: 'logged_not_in_allowlist',
      }
    }

    const token = env.get('FONNTE_TOKEN')
    if (token) {
      try {
        const response = await fetch('https://api.fonnte.com/send', {
          method: 'POST',
          headers: {
            Authorization: token,
          },
          body: new URLSearchParams({
            target: normalized,
            message: text,
            countryCode: '0',
          }),
          signal: AbortSignal.timeout(5000),
        })

        const body = (await response.json()) as {
          status?: boolean
          Status?: boolean
          reason?: string
        }
        if (body.status === true || body.Status === true) {
          return { sent: true, phone: normalized, reason: 'delivered' }
        }

        logger.warn({ phone: masked, reason: body.reason }, 'Fonnte rejected the WhatsApp message')
        return { sent: false, phone: normalized, reason: 'fonnte_rejected' }
      } catch (error) {
        logger.warn({ phone: masked, error }, 'Fonnte WhatsApp send error')
        return { sent: false, phone: normalized, reason: 'network_error' }
      }
    }

    if (env.get('NODE_ENV') === 'production') {
      logger.error(
        { phone: masked },
        'FONNTE_TOKEN is not set in production; WhatsApp message dropped'
      )
      return {
        sent: false,
        phone: normalized,
        reason: 'no_token_production',
      }
    }

    if (isDevelopment) {
      logger.info({ phone: masked, text }, 'WhatsApp message dispatched')
    } else {
      logger.info({ phone: masked, kind }, 'WhatsApp message dispatched')
    }
    return {
      sent: true,
      phone: normalized,
      reason: 'delivered',
    }
  }
}
