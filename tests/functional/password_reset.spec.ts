import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import hash from '@adonisjs/core/services/hash'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import { Role } from '#enums/role_enum'
import WhatsAppService from '#services/whatsapp_service'
import OtpCode from '#models/otp_code'
import { OtpPurpose } from '#enums/otp_purpose_enum'

test.group('Password Reset (GUEST-12, ACC-5)', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('GET /lupa-kata-sandi renders forgot password form', async ({ client }) => {
    const response = await client.get('/lupa-kata-sandi')
    response.assertStatus(200)
    response.assertTextIncludes('Lupa Kata Sandi')
    response.assertTextIncludes('Kirim Kode')
  })

  test('POST /lupa-kata-sandi refuses invalid phone number', async ({ client }) => {
    const response = await client
      .post('/lupa-kata-sandi')
      .header('referer', '/lupa-kata-sandi')
      .redirects(0)
      .withCsrfToken()
      .form({
        phone: '12345',
        turnstile: 'valid_token',
      })

    response.assertStatus(302)
    response.assertHeader('location', '/lupa-kata-sandi')
    response.assertValidationError(
      'phone',
      'Format nomor WhatsApp tidak valid (contoh: 081234567890).'
    )
  })

  test('POST /lupa-kata-sandi refuses invalid Turnstile token', async ({ client }) => {
    const response = await client
      .post('/lupa-kata-sandi')
      .header('referer', '/lupa-kata-sandi')
      .redirects(0)
      .withCsrfToken()
      .form({
        phone: '081299998888',
        turnstile: 'invalid_token',
      })

    response.assertStatus(302)
    response.assertHeader('location', '/lupa-kata-sandi')
    response.assertValidationError('turnstile', 'Selesaikan verifikasi keamanan, lalu coba lagi.')
  })

  test('POST /lupa-kata-sandi with unregistered phone displays exact sentence and sends no WhatsApp (GUEST-12)', async ({
    client,
    assert,
  }) => {
    const phone = '081200000091'
    const normalizedPhone = '6281200000091'

    const response = await client.post('/lupa-kata-sandi').redirects(0).withCsrfToken().form({
      phone,
      turnstile: 'valid_token',
    })

    response.assertStatus(302)
    response.assertHeader('location', '/verifikasi')
    response.assertFlashMessage('success', 'Jika nomor terdaftar, kode dikirim via WhatsApp.')

    // Verify no OTP code was dispatched for this unregistered phone
    const code = WhatsAppService.getLatestOtpCode(normalizedPhone)
    assert.isUndefined(code)

    const codeInDb = await OtpCode.query()
      .where('phone', normalizedPhone)
      .where('purpose', OtpPurpose.RESET_PASSWORD)
      .first()
    assert.isNull(codeInDb)
  })

  test('GET /kata-sandi-baru redirects to /lupa-kata-sandi when accessed without grant', async ({
    client,
  }) => {
    const response = await client.get('/kata-sandi-baru').redirects(0)
    response.assertStatus(302)
    response.assertHeader('location', '/lupa-kata-sandi')
  })

  test('Full forgot password journey resets password and signs out other devices (ACC-5, GUEST-12)', async ({
    client,
    assert,
  }) => {
    const phone = '081288889999'
    const normalizedPhone = '6281288889999'

    // Create existing user with an initial password
    const initialPassword = 'oldpassword123'
    const user = await User.create({
      fullName: 'Customer Reset',
      phone: normalizedPhone,
      password: initialPassword,
      role: Role.CUSTOMER,
      isActive: true,
    })

    // Simulate an existing remember-me token
    await db.table('remember_me_tokens').insert({
      tokenable_id: user.id,
      hash: 'existing_token_from_another_device',
      created_at: new Date(),
      updated_at: new Date(),
      expires_at: new Date(Date.now() + 3600000),
    })

    // Simulate an existing session in the sessions table for another device
    await db.table('sessions').insert({
      id: 'other_device_session_id',
      user_id: String(user.id),
      data: JSON.stringify({ userId: user.id }),
      expires_at: new Date(Date.now() + 3600000),
    })

    // 1. Request password reset
    const forgotResponse = await client.post('/lupa-kata-sandi').redirects(0).withCsrfToken().form({
      phone,
      turnstile: 'valid_token',
    })

    forgotResponse.assertStatus(302)
    forgotResponse.assertHeader('location', '/verifikasi')
    forgotResponse.assertFlashMessage('success', 'Jika nomor terdaftar, kode dikirim via WhatsApp.')

    // 2. Retrieve OTP sent via WhatsApp
    const otpCode = WhatsAppService.getLatestOtpCode(normalizedPhone)
    assert.isDefined(otpCode)

    // 3. Verify OTP
    const verifyResponse = await client
      .post('/verifikasi')
      .withSession(forgotResponse.session())
      .redirects(0)
      .withCsrfToken()
      .form({ code: otpCode })

    verifyResponse.assertStatus(302)
    verifyResponse.assertHeader('location', '/kata-sandi-baru')

    // 4. Access reset password page with grant
    const editResponse = await client.get('/kata-sandi-baru').withSession(verifyResponse.session())

    editResponse.assertStatus(200)
    editResponse.assertTextIncludes('Kata Sandi Baru')

    // 5. Submit new password
    const newPassword = 'newsecurepassword456'
    const updateResponse = await client
      .post('/kata-sandi-baru')
      .withSession(verifyResponse.session())
      .redirects(0)
      .withCsrfToken()
      .form({
        password: newPassword,
        passwordConfirmation: newPassword,
      })

    updateResponse.assertStatus(302)
    updateResponse.assertHeader('location', '/beranda')
    updateResponse.assertFlashMessage(
      'success',
      'Kata sandi berhasil diatur ulang. Selamat datang kembali!'
    )

    // 6. Verify database state
    await user.refresh()

    // Password was updated
    const isOldValid = await hash.verify(user.password, initialPassword)
    const isNewValid = await hash.verify(user.password, newPassword)
    assert.isFalse(isOldValid)
    assert.isTrue(isNewValid)

    // Remember-me token was revoked (ACC-5)
    const tokens = await db.from('remember_me_tokens').where('tokenable_id', user.id)
    assert.lengthOf(tokens, 0)

    // Other device session in sessions table was removed (ACC-5)
    const otherSession = await db.from('sessions').where('id', 'other_device_session_id').first()
    assert.isNull(otherSession)
  })
})
