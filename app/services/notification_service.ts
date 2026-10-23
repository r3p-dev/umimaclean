import { inject } from '@adonisjs/core'
import type { MessagePurpose } from '#enums/message_enum'
import type User from '#models/user'
import WhatsappMessage from '#models/whatsapp_message'
import FonnteService from '#services/fonnte_service'

@inject()
export default class NotificationService {
  constructor(protected fonnte: FonnteService) {}

  async send(message: {
    target: string
    purpose: MessagePurpose
    text: string
    orderId?: number | null
    userId?: number | null
  }) {
    const status = await this.fonnte.send(message.target, message.text)
    await WhatsappMessage.create({
      target: message.target,
      purpose: message.purpose,
      status,
      orderId: message.orderId ?? null,
      userId: message.userId ?? null,
    })
    return status
  }

  async toUser(user: User, purpose: MessagePurpose, text: string) {
    return this.send({ target: user.phone, purpose, text, userId: user.id })
  }
}
