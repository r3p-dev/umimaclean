import { test } from '@japa/runner'
import { IncomingMessage } from 'node:http'
import { Socket } from 'node:net'
import { RequestFactory } from '@adonisjs/core/factories/http'
import { http } from '#config/app'

function requestFrom(remoteAddress: string, forwardedFor: string) {
  const socket = new Socket()
  Object.defineProperty(socket, 'remoteAddress', { value: remoteAddress })
  const req = new IncomingMessage(socket)
  req.headers['x-forwarded-for'] = forwardedFor
  return new RequestFactory().merge({ req, config: http }).create()
}

test.group('Trusted proxies (ARCHITECTURE §1.2 rule 1)', () => {
  test('X-Forwarded-For is honoured from a trusted proxy (loopback by default)', ({ assert }) => {
    assert.equal(requestFrom('127.0.0.1', '198.51.100.7').ip(), '198.51.100.7')
    assert.equal(requestFrom('::1', '198.51.100.7').ip(), '198.51.100.7')
  })

  test('X-Forwarded-For is ignored from any other address', ({ assert }) => {
    assert.equal(requestFrom('203.0.113.9', '198.51.100.7').ip(), '203.0.113.9')
  })
})
