import { test } from '@japa/runner'
import { errors } from '@vinejs/vine'
import { createOrderValidator } from '#validators/order_validator'
import { validationMessagesOf } from '../helpers/validation.js'

const SHOE = { itemKind: 'shoe', brand: 'Nike', type: 'Air Force 1', size: '42' }
const BAG = { itemKind: 'bag', type: 'Ransel kanvas', size: 'M' }

function orderWith(overrides: Record<string, unknown>) {
  return {
    items: [SHOE],
    pickupAddressId: 1,
    deliveryAddressId: 1,
    pickupDate: '2030-01-08',
    pickupSlotId: 1,
    ...overrides,
  }
}

// The rules each failing draft breaks, as "field rule".
async function brokenRules(data: Record<string, unknown>) {
  try {
    await createOrderValidator.validate(data)
    return []
  } catch (error) {
    if (error instanceof errors.E_VALIDATION_ERROR) {
      return (error.messages as { field: string; rule: string }[]).map(
        (message) => `${message.field} ${message.rule}`
      )
    }
    throw error
  }
}

test.group('createOrderValidator (CUST-5, SVC-4, M5a decision 2)', () => {
  test('a shoe needs a type and an EU size from 20 to 50 in half steps; the brand is optional', async ({
    assert,
  }) => {
    for (const size of ['20', '42', '42.5', '49.5', '50']) {
      assert.deepEqual(await brokenRules(orderWith({ items: [{ ...SHOE, size }] })), [], size)
    }
    for (const size of ['19.5', '50.5', '42.3', '42,5', 'M']) {
      assert.deepEqual(
        await brokenRules(orderWith({ items: [{ ...SHOE, size }] })),
        ['items.0.size regex'],
        size
      )
    }
    assert.deepEqual(await brokenRules(orderWith({ items: [{ ...SHOE, brand: undefined }] })), [])
    assert.deepEqual(await brokenRules(orderWith({ items: [{ ...SHOE, type: '' }] })), [
      'items.0.type minLength',
    ])
  })

  test('a bag is Small, Medium, Large or X-Large', async ({ assert }) => {
    for (const size of ['S', 'M', 'L', 'XL']) {
      assert.deepEqual(await brokenRules(orderWith({ items: [{ ...BAG, size }] })), [], size)
    }
    assert.deepEqual(await brokenRules(orderWith({ items: [{ ...BAG, size: '42' }] })), [
      'items.0.size enum',
    ])
  })

  test('helmets are shop-only; at least one item, at most 20 shoes and 20 bags', async ({
    assert,
  }) => {
    assert.deepEqual(
      await brokenRules(orderWith({ items: [{ ...SHOE, itemKind: 'helmet', size: 'L' }] })),
      ['items.0.itemKind enum']
    )
    assert.deepEqual(await brokenRules(orderWith({ items: [] })), ['items array.minLength'])
    const twentyEach = [
      ...Array.from({ length: 20 }, () => SHOE),
      ...Array.from({ length: 20 }, () => BAG),
    ]
    assert.deepEqual(await brokenRules(orderWith({ items: twentyEach })), [])
    assert.deepEqual(await brokenRules(orderWith({ items: [...twentyEach, SHOE] })), [
      'items perKind',
    ])
  })

  test('the note holds up to 300 characters', async ({ assert }) => {
    assert.deepEqual(await brokenRules(orderWith({ note: 'a'.repeat(300) })), [])
    assert.deepEqual(await brokenRules(orderWith({ note: 'a'.repeat(301) })), ['note maxLength'])
  })

  test('the messages say what to fix, in Indonesian', async ({ assert }) => {
    const helmet = await validationMessagesOf(() =>
      createOrderValidator.validate(orderWith({ items: [{ ...SHOE, itemKind: 'helmet' }] }))
    )
    assert.equal(
      helmet[0].message,
      'Pesanan online hanya untuk sepatu dan tas; helm dilayani di toko.'
    )
    const tooMany = await validationMessagesOf(() =>
      createOrderValidator.validate(orderWith({ items: Array.from({ length: 21 }, () => BAG) }))
    )
    assert.equal(tooMany[0].message, 'Maksimal 20 sepatu dan 20 tas per pesanan.')
    const empty = await validationMessagesOf(() =>
      createOrderValidator.validate(orderWith({ items: [] }))
    )
    assert.equal(empty[0].message, 'Tambahkan minimal satu barang.')
  })
})
