import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import hash from '@adonisjs/core/services/hash'
import User from '#models/user'
import { Role } from '#enums/role_enum'
import { fakeWhatsApp } from '../helpers/fake_whatsapp_service.js'
import OtpCode from '#models/otp_code'
import { OtpPurpose } from '#enums/otp_purpose_enum'
import { ApiClient } from '@japa/api-client'

test.group('Password Reset (GUEST-12, ACC-5)', (group) => {
  group.each.setup(() => {
    fakeWhatsApp.clear()
    return testUtils.db().wrapInGlobalTransaction()
  })

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
    const code = fakeWhatsApp.getLatestOtpCode(normalizedPhone)
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
    assert,
  }) => {
    const phone = '081288889999'
    const normalizedPhone = '6281288889999'
    const initialPassword = 'oldpassword123'
    const newPassword = 'newsecurepassword456'

    // Create existing user with an initial password
    const user = await User.create({
      fullName: 'Customer Reset',
      phone: normalizedPhone,
      password: initialPassword,
      role: Role.CUSTOMER,
      isActive: true,
    })

    // Client 1 signs in through the real route with remember-me
    const client1 = new ApiClient(undefined, assert)
    const signin1 = await client1.post('/masuk').redirects(0).withCsrfToken().form({
      phone,
      password: initialPassword,
      rememberMe: true,
    })
    signin1.assertStatus(302)
    signin1.assertHeader('location', '/beranda')

    // Client 2 signs in through the real route with remember-me
    const client2 = new ApiClient(undefined, assert)
    const signin2 = await client2.post('/masuk').redirects(0).withCsrfToken().form({
      phone,
      password: initialPassword,
      rememberMe: true,
    })
    signin2.assertStatus(302)
    signin2.assertHeader('location', '/beranda')

    // Both clients are currently signed in and can access /beranda
    const check1 = await client1.get('/beranda').withAuthCookiesFrom(signin1).redirects(0)
    check1.assertStatus(200)
    const check2 = await client2.get('/beranda').withAuthCookiesFrom(signin2).redirects(0)
    check2.assertStatus(200)

    // Remember-me tokens exist for both devices
    const tokensBefore = await User.rememberMeTokens.all(user)
    assert.equal(tokensBefore.length, 2)

    // Client 3 performs the password reset journey through real routes
    const client3 = new ApiClient(undefined, assert)

    // 1. Request password reset
    const forgotResponse = await client3
      .post('/lupa-kata-sandi')
      .redirects(0)
      .withCsrfToken()
      .form({
        phone,
        turnstile: 'valid_token',
      })
    forgotResponse.assertStatus(302)
    forgotResponse.assertHeader('location', '/verifikasi')
    forgotResponse.assertFlashMessage('success', 'Jika nomor terdaftar, kode dikirim via WhatsApp.')

    // 2. Retrieve OTP sent via fake WhatsApp service
    const otpCode = fakeWhatsApp.getLatestOtpCode(normalizedPhone)
    assert.isDefined(otpCode)

    // 3. Verify OTP
    const verifyResponse = await client3
      .post('/verifikasi')
      .withSession(forgotResponse.session())
      .redirects(0)
      .withCsrfToken()
      .form({ code: otpCode })
    verifyResponse.assertStatus(302)
    verifyResponse.assertHeader('location', '/kata-sandi-baru')

    // 4. Access reset password page with grant
    const editResponse = await client3.get('/kata-sandi-baru').withSession(verifyResponse.session())
    editResponse.assertStatus(200)
    editResponse.assertTextIncludes('Kata Sandi Baru')

    // 5. Submit new password
    const updateResponse = await client3
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

    // 6. Verify password was updated in database
    await user.refresh()
    const isOldValid = await hash.verify(user.password, initialPassword)
    const isNewValid = await hash.verify(user.password, newPassword)
    assert.isFalse(isOldValid)
    assert.isTrue(isNewValid)

    // 7. Verify Client 1 is now signed out and redirected to /masuk
    const after1 = await client1.get('/beranda').withAuthCookiesFrom(signin1).redirects(0)
    after1.assertStatus(302)
    after1.assertHeader('location', '/masuk')

    // 8. Verify Client 2 is now signed out and redirected to /masuk
    const after2 = await client2.get('/beranda').withAuthCookiesFrom(signin2).redirects(0)
    after2.assertStatus(302)
    after2.assertHeader('location', '/masuk')

    // 9. Verify all remember-me tokens are gone (ACC-5)
    const tokensAfter = await User.rememberMeTokens.all(user)
    assert.lengthOf(tokensAfter, 0)
  })
})
