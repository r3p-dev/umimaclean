import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
import { normalizePhone } from '#helpers/phone'

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

interface DispatchedMessage {
  phone: string
  text: string
  dispatchedAt: number
}

export default class WhatsAppService {
  static #dispatched: DispatchedMessage[] = []

  static recordDispatched(phone: string, text: string): void {
    this.#dispatched.push({ phone, text, dispatchedAt: Date.now() })
  }

  static getDispatchedMessages(phone?: string): DispatchedMessage[] {
    if (!phone) {
      return [...this.#dispatched]
    }
    const normalized = normalizePhone(phone)
    return this.#dispatched.filter((item) => item.phone === normalized)
  }

  static getLatestOtpCode(phone: string): string | undefined {
    const messages = this.getDispatchedMessages(phone)
    const latest = messages[messages.length - 1]
    if (!latest) {
      return undefined
    }
    const match = latest.text.match(/\b(\d{6})\b/)
    return match ? match[1] : undefined
  }

  static clearDispatched(): void {
    this.#dispatched = []
  }

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
      WhatsAppService.recordDispatched(normalized, text)
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
          WhatsAppService.recordDispatched(normalized, text)
          return { sent: true, phone: normalized, reason: 'delivered' }
        }

        logger.warn({ reason: body.reason }, 'Fonnte rejected the WhatsApp message')
        return { sent: false, phone: normalized, reason: 'fonnte_rejected' }
      } catch (error) {
        logger.warn({ error }, 'Fonnte WhatsApp send error')
        return { sent: false, phone: normalized, reason: 'network_error' }
      }
    }

    if (env.get('NODE_ENV') === 'production') {
      logger.error('FONNTE_TOKEN is not set in production; WhatsApp message dropped')
      return {
        sent: false,
        phone: normalized,
        reason: 'no_token_production',
      }
    }

    logger.info({ phone: normalized, text }, 'WhatsApp message dispatched')
    WhatsAppService.recordDispatched(normalized, text)
    return {
      sent: true,
      phone: normalized,
      reason: 'delivered',
    }
  }
}
