import app from '@adonisjs/core/services/app'
import logger from '@adonisjs/core/services/logger'
import { MessageStatus } from '#enums/message_enum'
import env from '#start/env'

const FONNTE_SEND_URL = 'https://api.fonnte.com/send'

type FonnteResponse = { status?: boolean; Status?: boolean; reason?: string }

export default class FonnteService {
  async send(target: string, message: string): Promise<MessageStatus> {
    const token = env.get('FONNTE_TOKEN')
    if (!token) {
      if (app.inProduction) {
        logger.error('FONNTE_TOKEN is not set, WhatsApp message dropped')
        return MessageStatus.FAILED
      }

      logger.info({ target, message }, 'WhatsApp message (FONNTE_TOKEN not set, logged only)')
      return MessageStatus.LOGGED
    }

    try {
      const response = await fetch(FONNTE_SEND_URL, {
        method: 'POST',
        headers: { authorization: token.release() },
        body: new URLSearchParams({ target, message, countryCode: '0' }),
        signal: AbortSignal.timeout(5000),
      })

      const body = (await response.json()) as FonnteResponse
      if (body.status === true || body.Status === true) {
        return MessageStatus.SENT
      }

      logger.warn({ reason: body.reason }, 'Fonnte rejected the message')
      return MessageStatus.FAILED
    } catch (error) {
      logger.warn({ err: error }, 'Fonnte send failed')
      return MessageStatus.FAILED
    }
  }
}
