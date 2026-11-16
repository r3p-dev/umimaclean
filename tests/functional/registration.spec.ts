import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import { Role } from '#enums/role_enum'
import { fakeWhatsApp } from '../helpers/fake_whatsapp_service.js'
import OtpCode from '#models/otp_code'

test.group('Registration (GUEST-10)', (group) => {
  group.each.setup(() => {
    fakeWhatsApp.clear()
    return testUtils.db().wrapInGlobalTransaction()
  })

  test('GET /daftar renders registration form', async ({ client }) => {
    const response = await client.get('/daftar')
    response.assertStatus(200)
    response.assertTextIncludes('Buat Akun Umima Clean')
    response.assertTextIncludes('Syarat Layanan')
    response.assertTextIncludes('Kebijakan Privasi')
  })

  test('POST /daftar refuses registration if phone number is already registered', async ({
    client,
  }) => {
    await User.create({
      fullName: 'Pelanggan Lama',
      phone: '6281211112222',
      password: 'password123',
      role: Role.CUSTOMER,
      isActive: true,
    })

    const response = await client
      .post('/daftar')
      .header('referer', '/daftar')
      .redirects(0)
      .withCsrfToken()
      .form({
        name: 'Pelanggan Baru',
        phone: '081211112222',
        password: 'password123',
        passwordConfirmation: 'password123',
        terms: true,
        turnstile: 'dummy_token',
      })

    response.assertStatus(302)
    response.assertHeader('location', '/daftar')
    response.assertValidationError(
      'phone',
      'Nomor WhatsApp ini sudah terdaftar. Silakan masuk atau gunakan lupa kata sandi.'
    )
  })

  test('POST /daftar refuses registration if Turnstile token is invalid', async ({ client }) => {
    const response = await client
      .post('/daftar')
      .header('referer', '/daftar')
      .redirects(0)
      .withCsrfToken()
      .form({
        name: 'Pelanggan Baru',
        phone: '081233334444',
        password: 'password123',
        passwordConfirmation: 'password123',
        terms: true,
        turnstile: 'invalid_token',
      })

    response.assertStatus(302)
    response.assertHeader('location', '/daftar')
    response.assertValidationError('turnstile', 'Selesaikan verifikasi keamanan, lalu coba lagi.')
  })

  test('POST /daftar refuses registration if terms and conditions are not accepted', async ({
    client,
  }) => {
    const response = await client
      .post('/daftar')
      .header('referer', '/daftar')
      .redirects(0)
      .withCsrfToken()
      .form({
        name: 'Pelanggan Baru',
        phone: '081233334444',
        password: 'password123',
        passwordConfirmation: 'password123',
        terms: false,
        turnstile: 'dummy_token',
      })

    response.assertStatus(302)
    response.assertHeader('location', '/daftar')
    response.assertValidationError('terms', 'Setujui syarat & ketentuan untuk mendaftar.')
  })

  test('POST /daftar refuses registration if password confirmation does not match', async ({
    client,
  }) => {
    const response = await client
      .post('/daftar')
      .header('referer', '/daftar')
      .redirects(0)
      .withCsrfToken()
      .form({
        name: 'Pelanggan Baru',
        phone: '081233334444',
        password: 'password123',
        passwordConfirmation: 'differentpassword',
        terms: true,
        turnstile: 'dummy_token',
      })

    response.assertStatus(302)
    response.assertHeader('location', '/daftar')
    response.assertValidationError('passwordConfirmation', 'Kata sandi tidak sama.')
  })

  test('Full registration flow: /daftar -> /verifikasi -> account created & signed in on /beranda', async ({
    client,
    assert,
  }) => {
    const phone = '081255556666'
    const normalizedPhone = '6281255556666'

    // 1. Submit registration form
    const regResponse = await client.post('/daftar').redirects(0).withCsrfToken().form({
      name: 'Budi Pelanggan',
      phone,
      password: 'securepassword123',
      passwordConfirmation: 'securepassword123',
      terms: true,
      turnstile: 'valid_token',
    })

    regResponse.assertStatus(302)
    regResponse.assertHeader('location', '/verifikasi')

    // Verify user is NOT yet created in database
    const userBeforeOtp = await User.findBy('phone', normalizedPhone)
    assert.isNull(userBeforeOtp)

    // Retrieve OTP code from WhatsApp fake
    const otpCode = fakeWhatsApp.getLatestOtpCode(normalizedPhone)
    assert.isDefined(otpCode)

    // 2. Submit OTP verification using the same session
    const otpResponse = await client
      .post('/verifikasi')
      .withSession(regResponse.session())
      .redirects(0)
      .withCsrfToken()
      .form({ code: otpCode })

    otpResponse.assertStatus(302)
    otpResponse.assertHeader('location', '/beranda')

    // Verify account is now created in database with Role.CUSTOMER
    const userAfterOtp = await User.findBy('phone', normalizedPhone)
    assert.isNotNull(userAfterOtp)
    assert.equal(userAfterOtp!.fullName, 'Budi Pelanggan')
    assert.equal(userAfterOtp!.role, Role.CUSTOMER)
    assert.isTrue(userAfterOtp!.isActive)

    // Verify OTP record is marked consumed
    const codeRecord = await OtpCode.query().where('phone', normalizedPhone).firstOrFail()
    assert.isNotNull(codeRecord.consumedAt)
  })
})
