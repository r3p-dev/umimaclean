import { test } from '@japa/runner'
import { normalizePhone, isValidIndonesianPhone, maskPhone, formatPhone } from '#helpers/phone'

test.group('Phone normalization, formatting & masking (ACC-1)', () => {
  test('normalizePhone formats Indonesian numbers to 62...', ({ assert }) => {
    assert.equal(normalizePhone('081234567890'), '6281234567890')
    assert.equal(normalizePhone('0812-3456-7890'), '6281234567890')
    assert.equal(normalizePhone('+62 812 3456 7890'), '6281234567890')
    assert.equal(normalizePhone('81234567890'), '6281234567890')
    assert.equal(normalizePhone('6281234567890'), '6281234567890')
  })

  test('isValidIndonesianPhone validates proper mobile numbers starting with 628', ({ assert }) => {
    assert.isTrue(isValidIndonesianPhone('081234567890'))
    assert.isTrue(isValidIndonesianPhone('+6281234567890'))
    assert.isTrue(isValidIndonesianPhone('81234567890'))
    assert.isTrue(isValidIndonesianPhone('6281234567890'))

    // Invalid numbers: landline, too short, non-numeric
    assert.isFalse(isValidIndonesianPhone('0211234567'))
    assert.isFalse(isValidIndonesianPhone('08123'))
    assert.isFalse(isValidIndonesianPhone('abc123456789'))
  })

  test('maskPhone hides middle digits in logs and public output', ({ assert }) => {
    assert.equal(maskPhone('081234567890'), '62812****7890')
    assert.equal(maskPhone('6281234567890'), '62812****7890')
    assert.equal(maskPhone('123'), '123')
  })

  test('formatPhone formats numbers nicely with +62 prefix for display', ({ assert }) => {
    assert.equal(formatPhone('081234567890'), '+62 812 3456 7890')
    assert.equal(formatPhone('6281312345678'), '+62 813 1234 5678')
  })
})
