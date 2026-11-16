import { test } from '@japa/runner'
import WhatsAppService from '#services/whatsapp_service'
import env from '#start/env'

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
})
