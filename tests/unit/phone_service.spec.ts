import { test } from '@japa/runner'
import { lastFourDigits, maskPhone, normalizePhone, phoneProblem } from '#helpers/phone'

test.group('Phone normalization', () => {
  test('normalizes "{value}" to 628…')
    .with([
      '081234567890',
      '81234567890',
      '+6281234567890',
      '6281234567890',
      '0812-3456-7890',
      '+62 812 3456 7890',
      ' (0812) 3456.7890 ',
    ])
    .run(({ assert }, value) => {
      assert.equal(normalizePhone(value), '6281234567890')
    })

  test('rejects "{value}" as {problem}')
    .with([
      { value: '', problem: 'required' },
      { value: '0812a4567890', problem: 'format' },
      { value: '+1 415 555 0100', problem: 'prefix' },
      { value: '0212345678', problem: 'prefix' },
      { value: '08123456', problem: 'minLength' },
      { value: '62812345678901234', problem: 'maxLength' },
    ] as const)
    .run(({ assert }, { value, problem }) => {
      assert.equal(phoneProblem(value), problem)
      assert.isNull(normalizePhone(value))
    })

  test('masks the middle digits and exposes the last four', ({ assert }) => {
    assert.equal(maskPhone('6281223456789'), '+62 812-••••-6789')
    assert.equal(lastFourDigits('6281223456789'), '6789')
  })
})
