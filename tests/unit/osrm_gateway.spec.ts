import { createServer, type IncomingHttpHeaders } from 'node:http'
import type { AddressInfo } from 'node:net'
import { test } from '@japa/runner'
import OsrmGateway from '#services/osrm_gateway'

type Reply = { status?: number; body: object; delayMs?: number }

async function fakeOsrm(reply: Reply) {
  const requests: { url: string; headers: IncomingHttpHeaders }[] = []
  const server = createServer((request, response) => {
    requests.push({ url: request.url ?? '', headers: request.headers })
    setTimeout(() => {
      response.writeHead(reply.status ?? 200, { 'content-type': 'application/json' })
      response.end(JSON.stringify(reply.body))
    }, reply.delayMs ?? 0)
  })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address() as AddressInfo
  return {
    url: `http://127.0.0.1:${port}/`,
    requests,
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  }
}

const STORE = { lat: -6.9556, lng: 107.654 }
const HOME = { lat: -6.8895, lng: 107.6101 }
const OFFICE = { lat: -6.9215, lng: 107.6094 }

test.group('OsrmGateway', () => {
  test('asks /route with lng,lat pairs and maps the geometry to points', async ({
    assert,
    cleanup,
  }) => {
    const osrm = await fakeOsrm({
      body: {
        code: 'Ok',
        routes: [
          {
            distance: 9120.4,
            duration: 1300.2,
            geometry: {
              coordinates: [
                [107.654, -6.9556],
                [107.63, -6.92],
                [107.6101, -6.8895],
              ],
            },
          },
        ],
      },
    })
    cleanup(osrm.close)

    const route = await new OsrmGateway({ url: osrm.url, profile: 'bike' }).findRoute(STORE, HOME)

    assert.equal(
      osrm.requests[0].url,
      '/route/v1/bike/107.654,-6.9556;107.6101,-6.8895?overview=full&geometries=geojson'
    )
    assert.equal(osrm.requests[0].headers['user-agent'], 'UmimaClean-skripsi/1.0')
    assert.deepEqual(route, {
      meters: 9120.4,
      seconds: 1300.2,
      path: [STORE, { lat: -6.92, lng: 107.63 }, HOME],
    })
  })

  test('asks /table once for every leg and keeps unreachable legs empty', async ({
    assert,
    cleanup,
  }) => {
    const osrm = await fakeOsrm({
      body: {
        code: 'Ok',
        distances: [
          [9120, 4100],
          [0, null],
        ],
        durations: [
          [1300, 700],
          [0, null],
        ],
      },
    })
    cleanup(osrm.close)

    const legs = await new OsrmGateway({ url: osrm.url, profile: 'driving' }).findLegs([
      [STORE, HOME],
      [HOME, OFFICE],
      [STORE, OFFICE],
    ])

    assert.lengthOf(osrm.requests, 1)
    assert.equal(
      osrm.requests[0].url,
      '/table/v1/driving/107.654,-6.9556;107.6101,-6.8895;107.6094,-6.9215?sources=0;1&destinations=1;2&annotations=distance,duration'
    )
    assert.deepEqual(legs, [{ meters: 9120, seconds: 1300 }, null, { meters: 4100, seconds: 700 }])
  })

  test('throws when OSRM answers with an error code', async ({ assert, cleanup }) => {
    const osrm = await fakeOsrm({ status: 400, body: { code: 'NoRoute', message: 'No route' } })
    cleanup(osrm.close)

    await assert.rejects(
      () => new OsrmGateway({ url: osrm.url }).findRoute(STORE, HOME),
      /OSRM route failed: NoRoute/
    )
  })

  test('throws when OSRM is slower than the timeout or down', async ({ assert, cleanup }) => {
    const osrm = await fakeOsrm({ body: { code: 'Ok', routes: [] }, delayMs: 300 })
    cleanup(osrm.close)

    await assert.rejects(() =>
      new OsrmGateway({ url: osrm.url, timeoutMs: 50 }).findRoute(STORE, HOME)
    )
    await assert.rejects(() =>
      new OsrmGateway({ url: 'http://127.0.0.1:9' }).findLegs([[STORE, HOME]])
    )
  })

  test('does nothing without OSRM_URL', async ({ assert }) => {
    const gateway = new OsrmGateway({ url: undefined })
    assert.isNull(await gateway.findRoute(STORE, HOME))
    assert.isNull(await gateway.findLegs([[STORE, HOME]]))
  })
})
