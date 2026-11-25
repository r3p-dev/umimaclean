import type { MessageKind, SendMessageResult } from '#services/whatsapp_service'
import WhatsAppService from '#services/whatsapp_service'
import { normalizePhone } from '#helpers/phone'

export interface DispatchedWhatsAppMessage {
  phone: string
  text: string
  kind: MessageKind
  dispatchedAt: number
}

export class FakeWhatsAppService extends WhatsAppService {
  #dispatched: DispatchedWhatsAppMessage[] = []

  override async sendMessage(
    phone: string,
    text: string,
    kind: MessageKind = 'otp'
  ): Promise<SendMessageResult> {
    const normalized = normalizePhone(phone)
    this.#dispatched.push({ phone: normalized, text, kind, dispatchedAt: Date.now() })
    return {
      sent: true,
      phone: normalized,
      reason: 'delivered',
    }
  }

  getDispatchedMessages(phone?: string): DispatchedWhatsAppMessage[] {
    if (!phone) {
      return [...this.#dispatched]
    }
    const normalized = normalizePhone(phone)
    return this.#dispatched.filter((item) => item.phone === normalized)
  }

  getLatestOtpCode(phone: string): string | undefined {
    const messages = this.getDispatchedMessages(phone)
    const latest = messages[messages.length - 1]
    if (!latest) {
      return undefined
    }
    const match = latest.text.match(/\b(\d{6})\b/)
    return match ? match[1] : undefined
  }

  clear(): void {
    this.#dispatched = []
  }
}

export const fakeWhatsApp = new FakeWhatsAppService()
