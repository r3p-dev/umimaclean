import { test } from '@japa/runner'
import type { ApiClient } from '@japa/api-client'
import testUtils from '@adonisjs/core/services/test_utils'
import limiter from '@adonisjs/limiter/services/main'
import { DateTime } from 'luxon'
import User from '#models/user'
import OtpCode from '#models/otp_code'
import { Role } from '#enums/role_enum'
import { OtpPurpose } from '#enums/otp_purpose_enum'
import { OTP_INVALID_MESSAGE } from '#services/otp_service'
import { PHONE_IN_USE_MESSAGE } from '#services/account_service'
import { fakeWhatsApp } from '../helpers/fake_whatsapp_service.js'
import { visitRedirect } from '../helpers/inertia.js'

const NEW_PHONE = '6281200000399'

function createUser(phone: string, role: Role = Role.CUSTOMER) {
  return User.create({
    fullName: 'Rina Wulandari',
    phone,
    password: 'password123',
    role,
    isActive: true,
  })
}

test.group('Phone change (CUST-13, ACC-2, ACC-5)', (group) => {
  group.each.setup(async () => {
    fakeWhatsApp.clear()
    await limiter.clear(['memory'])
    return testUtils.db().wrapInGlobalTransaction()
  })

  function startChange(client: ApiClient, user: User, phone: string) {
    return client
      .post('/profil/nomor')
      .header('referer', '/profil/nomor')
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)
      .form({ phone })
  }

  test('GET /profil/nomor renders the phone change form (CUST-13)', async ({ client }) => {
    const user = await createUser('6281200000301')

    const response = await client.get('/profil/nomor').loginAs(user).withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('customer/profile/phone')
  })

  test('a number used by another account is refused (CUST-13)', async ({ client, assert }) => {
    const user = await createUser('6281200000302')
    await createUser('6281200000303', Role.STAFF)

    const response = await startChange(client, user, '081200000303')

    const page = await visitRedirect(client, response)
    page.assertInertiaPropsContains({ errors: { phone: PHONE_IN_USE_MESSAGE } })
    assert.lengthOf(fakeWhatsApp.getDispatchedMessages(), 0)
  })

  test('the current number and a malformed number are refused (CUST-13)', async ({ client }) => {
    const user = await createUser('6281200000304')

    const same = await visitRedirect(client, await startChange(client, user, '081200000304'))
    same.assertInertiaPropsContains({ errors: { phone: 'Ini nomor Anda saat ini.' } })

    const malformed = await visitRedirect(client, await startChange(client, user, '12345'))
    malformed.assertInertiaPropsContains({
      errors: { phone: 'Format nomor WhatsApp tidak valid (contoh: 081234567890).' },
    })
  })

  test('the OTP goes to the new number and a right code changes the phone (CUST-13, ACC-5)', async ({
    client,
    assert,
  }) => {
    const user = await createUser('6281200000305')
    const current = await User.rememberMeTokens.create(user, '180d')
    await User.rememberMeTokens.create(user, '180d')

    const started = await startChange(client, user, '081200000399')
    started.assertHeader('location', '/verifikasi')
    const code = fakeWhatsApp.getLatestOtpCode(NEW_PHONE)
    assert.isDefined(code)
    assert.lengthOf(fakeWhatsApp.getDispatchedMessages('6281200000305'), 0)

    const otpPage = await visitRedirect(client, started).loginAs(user)
    otpPage.assertInertiaComponent('auth/otp')
    otpPage.assertInertiaPropsContains({ purpose: 'change_phone', maskedPhone: '62812****0399' })

    const verified = await client
      .post('/verifikasi')
      .withSession(started.session())
      .loginAs(user)
      .withEncryptedCookie('remember_web', current.value!.release())
      .withCsrfToken()
      .redirects(0)
      .form({ code })

    verified.assertHeader('location', '/profil')
    verified.assertFlashMessage(
      'success',
      'Nomor WhatsApp diganti. Perangkat lain sudah dikeluarkan.'
    )
    await user.refresh()
    assert.equal(user.phone, NEW_PHONE)
    const remaining = await User.rememberMeTokens.all(user)
    assert.deepEqual(
      remaining.map((token) => String(token.identifier)),
      [String(current.identifier)]
    )
  })

  test('a wrong code and an expired code leave the phone unchanged (CUST-13, ACC-2)', async ({
    client,
    assert,
  }) => {
    const user = await createUser('6281200000306')
    const started = await startChange(client, user, '081200000399')
    const code = fakeWhatsApp.getLatestOtpCode(NEW_PHONE)

    const wrong = await client
      .post('/verifikasi')
      .header('referer', '/verifikasi')
      .withSession(started.session())
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)
      .form({ code: code === '000000' ? '111111' : '000000' })
    const wrongPage = await visitRedirect(client, wrong).loginAs(user)
    wrongPage.assertInertiaPropsContains({ errors: { code: OTP_INVALID_MESSAGE } })

    await OtpCode.query()
      .where('phone', NEW_PHONE)
      .where('purpose', OtpPurpose.CHANGE_PHONE)
      .update({ expires_at: DateTime.now().minus({ minutes: 1 }).toJSDate() })
    const expired = await client
      .post('/verifikasi')
      .header('referer', '/verifikasi')
      .withSession(started.session())
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)
      .form({ code })
    const expiredPage = await visitRedirect(client, expired).loginAs(user)
    expiredPage.assertInertiaPropsContains({ errors: { code: OTP_INVALID_MESSAGE } })

    await user.refresh()
    assert.equal(user.phone, '6281200000306')
  })

  test('a number taken while the code was pending is refused at verification (CUST-13)', async ({
    client,
    assert,
  }) => {
    const user = await createUser('6281200000307')
    const started = await startChange(client, user, '081200000399')
    await createUser(NEW_PHONE)

    const verified = await client
      .post('/verifikasi')
      .header('referer', '/verifikasi')
      .withSession(started.session())
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)
      .form({ code: fakeWhatsApp.getLatestOtpCode(NEW_PHONE) })

    const page = await visitRedirect(client, verified).loginAs(user)
    page.assertInertiaPropsContains({ errors: { code: PHONE_IN_USE_MESSAGE } })
    await user.refresh()
    assert.equal(user.phone, '6281200000307')
  })

  test('a phone change started by one account cannot be finished by another (CUST-13)', async ({
    client,
    assert,
  }) => {
    const owner = await createUser('6281200000308')
    const other = await createUser('6281200000309')
    const started = await startChange(client, owner, '081200000399')

    const response = await client
      .post('/verifikasi')
      .withSession(started.session())
      .loginAs(other)
      .withCsrfToken()
      .redirects(0)
      .form({ code: fakeWhatsApp.getLatestOtpCode(NEW_PHONE) })

    response.assertHeader('location', '/masuk')
    await owner.refresh()
    await other.refresh()
    assert.equal(owner.phone, '6281200000308')
    assert.equal(other.phone, '6281200000309')
  })
})
