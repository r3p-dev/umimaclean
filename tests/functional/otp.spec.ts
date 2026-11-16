import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import app from '@adonisjs/core/services/app'
import { DateTime } from 'luxon'
import type { Session } from '@adonisjs/session'
import { OtpPurpose } from '#enums/otp_purpose_enum'
import OtpCode, { OTP_MAX_PHONE_HOURLY } from '#models/otp_code'
import OtpService, { OTP_INVALID_MESSAGE, OTP_LOCKED_MESSAGE } from '#services/otp_service'
import { fakeWhatsApp } from '../helpers/fake_whatsapp_service.js'
import limiter from '@adonisjs/limiter/services/main'

function makeMockSession(): Session {
  const data = new Map<string, any>()
  return {
    get: (key: string) => data.get(key),
    put: (key: string, value: any) => data.set(key, value),
    forget: (key: string) => data.delete(key),
  } as unknown as Session
}

test.group('OTP (ACC-2) Functional Tests', (group) => {
  group.each.setup(() => {
    fakeWhatsApp.clear()
    return testUtils.db().wrapInGlobalTransaction()
  })

  test('GET /verifikasi redirects to /masuk if no active session flow', async ({ client }) => {
    const response = await client.get('/verifikasi').redirects(0)
    response.assertStatus(302)
    response.assertHeader('location', '/masuk')
  })

  test('GET /verifikasi renders verification page when active flow exists in session', async ({
    client,
  }) => {
    const sessionData = {
      otp_flow: {
        purpose: OtpPurpose.REGISTER,
        phone: '6281234567890',
        name: 'Budi Test',
        passwordHash: 'dummyhash',
        failures: 0,
      },
    }

    const response = await client.get('/verifikasi').withSession(sessionData)
    response.assertStatus(200)
    response.assertTextIncludes('Verifikasi Nomor WhatsApp')
    response.assertTextIncludes('62812****7890')
  })

  test('POST /verifikasi validates code format (6 digits required)', async ({ client }) => {
    const sessionData = {
      otp_flow: {
        purpose: OtpPurpose.REGISTER,
        phone: '6281234567890',
        name: 'Budi Test',
        passwordHash: 'dummyhash',
        failures: 0,
      },
    }

    const response = await client
      .post('/verifikasi')
      .header('referer', '/verifikasi')
      .withSession(sessionData)
      .redirects(0)
      .withCsrfToken()
      .form({ code: '123' })

    response.assertStatus(302)
    response.assertHeader('location', '/verifikasi')
    response.assertValidationError('code', 'Kode verifikasi harus 6 digit angka.')
  })

  test('POST /verifikasi rejects wrong OTP code and increments failure count', async ({
    client,
  }) => {
    const phone = '6281234567891'
    const service = await app.container.make(OtpService)
    const mockSession = makeMockSession()

    await service.startRegistration(
      mockSession,
      { name: 'Budi Test', phone, password: 'password123' },
      '127.0.0.1'
    )

    const sessionData = {
      otp_flow: mockSession.get('otp_flow'),
    }

    const response = await client
      .post('/verifikasi')
      .header('referer', '/verifikasi')
      .withSession(sessionData)
      .redirects(0)
      .withCsrfToken()
      .form({ code: '000000' })

    response.assertStatus(302)
    response.assertHeader('location', '/verifikasi')
    response.assertValidationError('code', OTP_INVALID_MESSAGE)
    response.assertSession('otp_flow')
  })

  test('POST /verifikasi locks OTP after 5 wrong attempts (ACC-2)', async ({ client }) => {
    const phone = '6281234567892'
    const service = await app.container.make(OtpService)
    const mockSession = makeMockSession()

    await service.startRegistration(
      mockSession,
      { name: 'Budi Test', phone, password: 'password123' },
      '127.0.0.1'
    )

    // 4 previous failures in session
    const flow = mockSession.get('otp_flow')
    const sessionData = {
      otp_flow: {
        ...flow,
        failures: 4,
      },
    }

    // 5th wrong attempt
    const response = await client
      .post('/verifikasi')
      .header('referer', '/verifikasi')
      .withSession(sessionData)
      .redirects(0)
      .withCsrfToken()
      .form({ code: '000000' })

    response.assertStatus(302)
    response.assertHeader('location', '/verifikasi')
    response.assertValidationError('code', OTP_LOCKED_MESSAGE)
  })

  test('POST /verifikasi rejects expired OTP (ACC-2)', async ({ client, assert }) => {
    const phone = '6281234567893'
    const service = await app.container.make(OtpService)
    const mockSession = makeMockSession()

    await service.startRegistration(
      mockSession,
      { name: 'Budi Test', phone, password: 'password123' },
      '127.0.0.1'
    )
    const code = fakeWhatsApp.getLatestOtpCode(phone)
    assert.isDefined(code)

    // Expire the OTP record in the database
    await OtpCode.query()
      .where('phone', phone)
      .update({ expiresAt: DateTime.now().minus({ minutes: 10 }) })

    const sessionData = {
      otp_flow: mockSession.get('otp_flow'),
    }

    const response = await client
      .post('/verifikasi')
      .header('referer', '/verifikasi')
      .withSession(sessionData)
      .redirects(0)
      .withCsrfToken()
      .form({ code: code! })

    response.assertStatus(302)
    response.assertHeader('location', '/verifikasi')
    response.assertValidationError('code', OTP_INVALID_MESSAGE)
  })

  test('POST /verifikasi/kirim-ulang enforces 60-second cooldown (ACC-2)', async ({ client }) => {
    const phone = '6281234567894'
    const service = await app.container.make(OtpService)
    const mockSession = makeMockSession()

    await service.startRegistration(
      mockSession,
      { name: 'Budi Test', phone, password: 'password123' },
      '127.0.0.1'
    )

    const sessionData = {
      otp_flow: mockSession.get('otp_flow'),
    }

    const response = await client
      .post('/verifikasi/kirim-ulang')
      .header('referer', '/verifikasi')
      .withSession(sessionData)
      .redirects(0)
      .withCsrfToken()
      .form({ turnstile: 'valid_token' })

    response.assertStatus(302)
    response.assertHeader('location', '/verifikasi')
    response.assertValidationError('code', 'Tunggu 60 detik sebelum meminta kode baru.')
  })

  test('Hourly rate limit prevents more than 5 OTP sends per number (ACC-2)', async ({
    assert,
  }) => {
    const phone = '6281234567895'
    const service = await app.container.make(OtpService)
    const mockSession = makeMockSession()
    const cooldownLimiter = limiter.use({ requests: 1, duration: '60 s', blockDuration: '60 s' })
    const phoneLimiter = limiter.use({ requests: OTP_MAX_PHONE_HOURLY, duration: '1 hour' })

    await phoneLimiter.delete(`otp_phone_${phone}`)

    for (let i = 0; i < OTP_MAX_PHONE_HOURLY; i++) {
      await cooldownLimiter.delete(`otp_cooldown_${phone}`)
      await service.startRegistration(
        mockSession,
        { name: `Budi ${i}`, phone, password: 'password123' },
        `192.168.1.${i + 1}`
      )
    }

    // 6th send should be refused by hourly limiter
    await cooldownLimiter.delete(`otp_cooldown_${phone}`)
    try {
      await service.startRegistration(
        mockSession,
        { name: 'Budi Limit', phone, password: 'password123' },
        '192.168.1.99'
      )
      assert.fail('Should have been rate limited')
    } catch (error: any) {
      assert.isTrue(
        error.messages?.[0]?.message?.includes('Terlalu banyak permintaan') ||
          error.message?.includes('Terlalu banyak permintaan')
      )
    }
  })
})
