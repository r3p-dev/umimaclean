import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import OtpService from '#services/otp_service'
import OtpCode from '#models/otp_code'
import { OtpPurpose } from '#enums/otp_purpose_enum'
import WhatsAppService from '#services/whatsapp_service'
import app from '@adonisjs/core/services/app'
import { DateTime } from 'luxon'
import type { Session } from '@adonisjs/session'

function makeMockSession(): Session {
  const data = new Map<string, any>()
  return {
    get: (key: string) => data.get(key),
    put: (key: string, value: any) => data.set(key, value),
    forget: (key: string) => data.delete(key),
  } as unknown as Session
}

test.group('OTP rules (ACC-2)', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('OTP is generated as 6 digits, stored only as keyed hash, and dispatched via WhatsApp', async ({
    assert,
  }) => {
    const service = await app.container.make(OtpService)
    const session = makeMockSession()
    const phone = '6281200000050'

    await service.startRegistration(
      session,
      { name: 'Test User', phone, password: 'password123' },
      '127.0.0.1'
    )

    const codeRecord = await OtpCode.query()
      .where('phone', phone)
      .where('purpose', OtpPurpose.REGISTER)
      .firstOrFail()

    // Stored code is 64 hex characters (SHA-256 HMAC), never 6 plaintext digits
    assert.equal(codeRecord.codeHash.length, 64)
    assert.match(codeRecord.codeHash, /^[0-9a-f]{64}$/)

    // Dispatched message contains 6 digits
    const code = WhatsAppService.getLatestOtpCode(phone)
    assert.isDefined(code)
    assert.match(code!, /^\d{6}$/)
  })

  test('wrong code increments attempts and locks after 5 wrong attempts', async ({ assert }) => {
    const service = await app.container.make(OtpService)
    const session = makeMockSession()
    const phone = '6281200000051'

    await service.startRegistration(
      session,
      { name: 'Wrong Code User', phone, password: 'password123' },
      '127.0.0.1'
    )

    const flow = service.currentOtpFlow(session)!
    assert.isNotNull(flow)

    // 4 wrong attempts
    for (let i = 1; i <= 4; i++) {
      const { result } = await service.verifyOtp(flow, '000000')
      assert.equal(result, 'invalid')
      const msg = service.recordOtpFailure(session, flow, false)
      assert.include(msg, 'Kode verifikasi salah')
    }

    const codeRecord = await OtpCode.query().where('phone', phone).firstOrFail()
    assert.equal(codeRecord.attempts, 4)

    // 5th wrong attempt locks the code
    const { result: fifthResult } = await service.verifyOtp(flow, '000000')
    assert.equal(fifthResult, 'locked')
    const lockedMsg = service.recordOtpFailure(session, flow, true)
    assert.include(lockedMsg, 'Kode salah 5 kali')

    // Any subsequent attempt is rejected as locked
    const { result: sixthResult } = await service.verifyOtp(flow, '000000')
    assert.equal(sixthResult, 'locked')
  })

  test('expired OTP cannot be verified (validity 5 minutes)', async ({ assert }) => {
    const service = await app.container.make(OtpService)
    const session = makeMockSession()
    const phone = '6281200000052'

    await service.startRegistration(
      session,
      { name: 'Expired User', phone, password: 'password123' },
      '127.0.0.1'
    )

    const flow = service.currentOtpFlow(session)!
    const validCode = WhatsAppService.getLatestOtpCode(phone)!

    // Manually expire the code
    await OtpCode.query()
      .where('phone', phone)
      .update({ expires_at: DateTime.now().minus({ minutes: 6 }).toJSDate() })

    const { result, user } = await service.verifyOtp(flow, validCode)
    assert.equal(result, 'invalid')
    assert.isNull(user)
  })

  test('resend cooldown prevents requesting code within 60 seconds', async ({ assert }) => {
    const service = await app.container.make(OtpService)
    const session = makeMockSession()
    const phone = '6281200000053'

    await service.startRegistration(
      session,
      { name: 'Cooldown User', phone, password: 'password123' },
      '127.0.0.1'
    )

    const flow = service.currentOtpFlow(session)!

    // Immediate resend should be refused due to 60s cooldown
    try {
      await service.resendOtp(session, flow, '127.0.0.1')
      assert.fail('Should have thrown cooldown error')
    } catch (error: any) {
      assert.equal(error.messages?.[0]?.field, 'code')
      assert.include(error.messages?.[0]?.message, 'Tunggu')
      assert.include(error.messages?.[0]?.message, 'detik sebelum meminta kode baru.')
    }
  })

  test('purpose isolation: code issued for register cannot be verified for reset_password', async ({
    assert,
  }) => {
    const service = await app.container.make(OtpService)
    const session = makeMockSession()
    const phone = '6281200000054'

    await service.startRegistration(
      session,
      { name: 'Purpose User', phone, password: 'password123' },
      '127.0.0.1'
    )

    const code = WhatsAppService.getLatestOtpCode(phone)!

    // Attempt to verify with a reset_password flow
    const fakeResetFlow = {
      purpose: OtpPurpose.RESET_PASSWORD,
      phone,
      failures: 0,
    }

    const { result, user } = await service.verifyOtp(fakeResetFlow, code)
    assert.equal(result, 'invalid')
    assert.isNull(user)
  })

  test('send limits: max 5 sends per number per hour', async ({ assert }) => {
    const service = await app.container.make(OtpService)
    const session = makeMockSession()
    const phone = '6281200000055'

    for (let i = 1; i <= 5; i++) {
      await service.startRegistration(
        session,
        { name: 'Limit User', phone, password: 'password123' },
        `192.168.10.${i}`
      )
      // Clear cooldown so next attempt tests the hourly phone limiter
      const l = await import('@adonisjs/limiter/services/main').then((m) => m.default)
      await l
        .use({ requests: 1, duration: '60 s', blockDuration: '60 s' })
        .delete(`otp_cooldown_${phone}`)
    }

    // 6th send should fail with rate limit error
    try {
      await service.startRegistration(
        session,
        { name: 'Limit User', phone, password: 'password123' },
        '192.168.10.99'
      )
      assert.fail('Should have failed due to phone hourly limit')
    } catch (error: any) {
      assert.equal(error.messages?.[0]?.field, 'phone')
      assert.include(error.messages?.[0]?.message, 'Terlalu banyak permintaan kode.')
    }
  })
})
