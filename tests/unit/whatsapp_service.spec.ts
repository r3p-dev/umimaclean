import { test } from '@japa/runner'
import WhatsAppService from '#services/whatsapp_service'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
import { maskPhone } from '#helpers/phone'

test.group('WhatsAppService', () => {
  test('outside production, sends only to numbers in WHATSAPP_ALLOWED_PHONES and logs others', async ({
    assert,
  }) => {
    const service = new WhatsAppService()

    // Test with configured allowed phone
    env.set('WHATSAPP_ALLOWED_PHONES', '081298765432, 081312345678')

    // Allowed phone (local 08... matches normalized 62...)
    const allowedResult = await service.sendMessage('081298765432', 'Kode OTP Anda: 123456')
    assert.isTrue(allowedResult.sent)
    assert.equal(allowedResult.reason, 'delivered')
    assert.equal(allowedResult.phone, '6281298765432')

    // Disallowed phone goes to log only
    const disallowedResult = await service.sendMessage('081999888777', 'Pesan rahasia')
    assert.isFalse(disallowedResult.sent)
    assert.equal(disallowedResult.reason, 'logged_not_in_allowlist')
    assert.equal(disallowedResult.phone, '6281999888777')
  })

  test('refuses sending when WHATSAPP_ALLOWED_PHONES is empty outside production', async ({
    assert,
  }) => {
    const service = new WhatsAppService()
    env.set('WHATSAPP_ALLOWED_PHONES', '')

    const result = await service.sendMessage('081298765432', 'Halo')
    assert.isFalse(result.sent)
    assert.equal(result.reason, 'logged_not_in_allowlist')
  })

  test('outside development, logging masks phone and never logs message text', async ({
    assert,
  }) => {
    const service = new WhatsAppService()
    env.set('NODE_ENV', 'test')
    env.set('WHATSAPP_ALLOWED_PHONES', '081298765432')

    const logged: string[] = []
    const originalInfo = logger.info.bind(logger)
    logger.info = ((data: any, msg?: any) => {
      logged.push(JSON.stringify(data) + ' ' + String(msg || ''))
      return originalInfo(data, msg)
    }) as any

    try {
      const code = '654321'
      const text = `Kode verifikasi Anda adalah ${code}`
      await service.sendMessage('081298765432', text)

      assert.isTrue(logged.length > 0)
      for (const entry of logged) {
        assert.notInclude(entry, '081298765432')
        assert.notInclude(entry, '6281298765432')
        assert.notInclude(entry, code)
        assert.notInclude(entry, text)
        assert.include(entry, maskPhone('081298765432'))
      }
    } finally {
      logger.info = originalInfo
    }
  })
})
