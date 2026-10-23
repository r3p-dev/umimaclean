import { IncomingMessage } from 'node:http'
import { Socket } from 'node:net'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { AREA_POINTS, useApp } from '#tests/support/app'

async function ipSeenFrom(remoteAddress: string) {
  const socket = new Socket()
  Object.defineProperty(socket, 'remoteAddress', { value: remoteAddress })
  const request = new IncomingMessage(socket)
  request.headers['x-forwarded-for'] = '203.0.113.7'
  const ctx = await testUtils.createHttpContext({ req: request })
  return ctx.request.ip()
}

test.group('Client IP behind the proxy', (group) => {
  useApp(group)

  test('X-Forwarded-For counts only when the request comes from a trusted proxy', async ({
    assert,
  }) => {
    assert.equal(await ipSeenFrom('127.0.0.1'), '203.0.113.7')
    assert.equal(await ipSeenFrom('10.89.0.12'), '203.0.113.7')
    assert.equal(await ipSeenFrom('192.168.1.5'), '203.0.113.7')
    assert.equal(await ipSeenFrom('198.51.100.20'), '198.51.100.20')
  })

  test('per-IP limits follow the forwarded client IP', async ({ client }) => {
    const check = (ip: string) =>
      client
        .get('/area')
        .qs(AREA_POINTS.covered)
        .header('x-forwarded-for', ip)
        .header('accept', 'application/json')

    for (let request = 0; request < 60; request++) {
      const response = await check('203.0.113.7')
      response.assertStatus(200)
    }

    const limited = await check('203.0.113.7')
    limited.assertStatus(429)
    const otherClient = await check('203.0.113.8')
    otherClient.assertStatus(200)
  })
})
