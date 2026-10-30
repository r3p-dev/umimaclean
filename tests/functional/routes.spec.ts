import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'
import { UserFactory } from '#database/factories/user_factory'
import { estimateLeg, straightMeters } from '#helpers/route'
import OrderAddress from '#models/order_address'
import type { Point } from '#models/service_area'
import { STORE_POINT } from '#models/setting'
import OsrmGateway from '#services/osrm_gateway'
import type { RoadLeg } from '#services/types'
import { SERVICE_ZONE } from '#validators/shared/rules/pickup'
import { createOrder, inertia, useApp } from '#tests/support/app'

class FakeOsrm extends OsrmGateway {
  routes: [Point, Point][] = []
  tables: [Point, Point][][] = []
  shouldFail = false

  override async findRoute(from: Point, to: Point) {
    this.routes.push([from, to])
    if (this.shouldFail) {
      throw new Error('OSRM down')
    }
    return { meters: 5230, seconds: 840, path: [from, { lat: -6.9, lng: 107.62 }, to] }
  }

  override async findLegs(pairs: [Point, Point][]): Promise<(RoadLeg | null)[]> {
    this.tables.push(pairs)
    if (this.shouldFail) {
      throw new Error('OSRM down')
    }
    return pairs.map((_, index) => ({ meters: 4321 + index * 1000, seconds: 600 + index * 60 }))
  }
}

const FROM = { lat: -6.9556, lng: 107.654 }
const TO = { lat: -6.8895, lng: 107.6101 }
const LOCAL_OSRM = process.env.OSRM_TEST_URL ?? 'http://127.0.0.1:5000'

function routeUrl(from: Point, to: Point) {
  return `/staf/rute?${new URLSearchParams({
    fromLat: String(from.lat),
    fromLng: String(from.lng),
    toLat: String(to.lat),
    toLng: String(to.lng),
  })}`
}

async function pickupToday(lat: number, lng: number) {
  const customer = await UserFactory.create()
  const order = await createOrder(customer, {
    pickupDate: DateTime.now().setZone(SERVICE_ZONE).startOf('day'),
  })
  await OrderAddress.query().where('order_id', order.id).update({ lat, lng })
  return order
}

async function isLocalOsrmUp() {
  try {
    const response = await fetch(`${LOCAL_OSRM}/nearest/v1/driving/107.6,-6.9`, {
      signal: AbortSignal.timeout(1000),
    })
    return response.ok
  } catch {
    return false
  }
}

test.group('Courier routes', (group) => {
  useApp(group)
  group.each.teardown(() => app.container.restore(OsrmGateway))

  function useOsrm(gateway: OsrmGateway) {
    app.container.swap(OsrmGateway, () => gateway)
    return gateway
  }

  test('staff get the OSRM route line, distance and duration', async ({ client, assert }) => {
    const osrm = useOsrm(new FakeOsrm())
    const staff = await UserFactory.apply('staff').create()

    const response = await client.get(routeUrl(FROM, TO)).loginAs(staff)

    response.assertStatus(200)
    response.assertBody({
      source: 'osrm',
      meters: 5230,
      seconds: 840,
      path: [FROM, { lat: -6.9, lng: 107.62 }, TO],
    })
    assert.deepEqual((osrm as FakeOsrm).routes, [[FROM, TO]])
  })

  test('falls back to an estimate when OSRM fails, is down or is slow', async ({
    client,
    assert,
    cleanup,
  }) => {
    const staff = await UserFactory.apply('admin').create()
    const estimate = { source: 'estimate', ...estimateLeg(FROM, TO), path: [FROM, TO] }

    const failing = new FakeOsrm()
    failing.shouldFail = true
    useOsrm(failing)
    const failed = await client.get(routeUrl(FROM, TO)).loginAs(staff)
    failed.assertBody(estimate)

    useOsrm(new OsrmGateway({ url: 'http://127.0.0.1:9' }))
    const down = await client.get(routeUrl(FROM, TO)).loginAs(staff)
    down.assertBody(estimate)

    const slow = createServer((_, response) => {
      setTimeout(() => response.end('{"code":"Ok","routes":[]}'), 300)
    })
    await new Promise<void>((resolve) => slow.listen(0, '127.0.0.1', resolve))
    cleanup(() => new Promise<void>((resolve) => slow.close(() => resolve())))
    const { port } = slow.address() as AddressInfo
    useOsrm(new OsrmGateway({ url: `http://127.0.0.1:${port}`, timeoutMs: 50 }))
    const late = await client.get(routeUrl(FROM, TO)).loginAs(staff)
    late.assertBody(estimate)

    assert.closeTo(estimate.meters / straightMeters(FROM, TO), 1.3, 1e-9)
  })

  test('without OSRM_URL the estimate is used and nothing is called', async ({ client }) => {
    const staff = await UserFactory.apply('staff').create()
    const response = await client.get(routeUrl(FROM, TO)).loginAs(staff)
    response.assertBody({ source: 'estimate', ...estimateLeg(FROM, TO), path: [FROM, TO] })
  })

  test('only staff and the owner can ask for a route', async ({ client, assert }) => {
    useOsrm(new FakeOsrm())
    const customer = await UserFactory.create()

    const asCustomer = await client.get(routeUrl(FROM, TO)).loginAs(customer).redirects(0)
    asCustomer.assertStatus(302)
    const asGuest = await client.get(routeUrl(FROM, TO)).redirects(0)
    asGuest.assertStatus(302)
    assert.match(asGuest.header('location') ?? '', /^\/staf\/masuk/)

    const staff = await UserFactory.apply('staff').create()
    const invalid = await client
      .get('/staf/rute?fromLat=-6.9&fromLng=107.6&toLat=200')
      .header('accept', 'application/json')
      .loginAs(staff)
    invalid.assertStatus(422)
  })

  test('each card shows the leg from the stop before it, the first from the store', async ({
    client,
    assert,
  }) => {
    const osrm = useOsrm(new FakeOsrm()) as FakeOsrm
    const staff = await UserFactory.apply('staff').create()
    const first = { lat: -6.90123, lng: 107.61234 }
    const second = { lat: -6.90321, lng: 107.61432 }
    await pickupToday(first.lat, first.lng)
    await pickupToday(second.lat, second.lng)

    const response = await inertia(client, '/staf/jemput').loginAs(staff)
    const props = response.inertiaProps as {
      tasks: { km: string; eta: string; legFrom: string | null }[]
      total: { km: string; eta: string }
    }
    assert.deepEqual(
      props.tasks.map((task) => [task.km, task.eta, task.legFrom]),
      [
        ['4,3 km', '10 mnt', 'dari toko'],
        ['5,3 km', '11 mnt', null],
      ]
    )
    assert.deepEqual(props.total, { km: '9,6 km', eta: '21 mnt' })
    assert.deepEqual(osrm.tables, [
      [
        [STORE_POINT, first],
        [first, second],
      ],
    ])

    await inertia(client, '/staf/jemput').loginAs(staff)
    assert.lengthOf(osrm.tables, 1)
  })

  test('with GPS the first leg starts at the courier and only that leg is asked again', async ({
    client,
    assert,
  }) => {
    const osrm = useOsrm(new FakeOsrm()) as FakeOsrm
    const staff = await UserFactory.apply('staff').create()
    const first = { lat: -6.90123, lng: 107.61234 }
    const second = { lat: -6.90321, lng: 107.61432 }
    await pickupToday(first.lat, first.lng)
    await pickupToday(second.lat, second.lng)
    await inertia(client, '/staf/jemput').loginAs(staff)

    const response = await inertia(client, '/staf/jemput')
      .header('x-courier-position', '-6.91234,107.62345')
      .loginAs(staff)
    const [task] = (response.inertiaProps as { tasks: { legFrom: string | null }[] }).tasks
    assert.equal(task.legFrom, 'dari posisi Anda')
    assert.deepEqual(osrm.tables[1], [[{ lat: -6.912, lng: 107.623 }, first]])
  })

  test('estimate legs and a total containing one are marked', async ({ client, assert }) => {
    const osrm = useOsrm(new FakeOsrm()) as FakeOsrm
    osrm.shouldFail = true
    const staff = await UserFactory.apply('staff').create()
    const point = { lat: -6.90555, lng: 107.61666 }
    await pickupToday(point.lat, point.lng)

    const response = await inertia(client, '/staf/jemput').loginAs(staff)
    const props = response.inertiaProps as {
      tasks: { km: string; eta: string }[]
      total: { km: string; eta: string }
    }
    const leg = estimateLeg(STORE_POINT, point)
    const km = `± ${(leg.meters / 1000).toFixed(1).replace('.', ',')} km`
    const eta = `± ${Math.round(leg.seconds / 60)} mnt`
    assert.deepEqual(props.tasks[0], { ...props.tasks[0], km, eta })
    assert.deepEqual(props.total, { km, eta })
    assert.lengthOf(osrm.tables, 1)
  })

  test('OSRM failures log one warning a minute', async ({ client, assert, cleanup }) => {
    const failing = new FakeOsrm()
    failing.shouldFail = true
    useOsrm(failing)
    const warnings: unknown[][] = []
    const warn = logger.warn
    logger.warn = ((...args: unknown[]) => {
      warnings.push(args)
    }) as typeof logger.warn
    cleanup(() => {
      logger.warn = warn
    })
    const staff = await UserFactory.apply('staff').create()

    for (let count = 0; count < 3; count++) {
      await client.get(routeUrl(FROM, TO)).loginAs(staff)
    }

    assert.lengthOf(warnings, 1)
    assert.match(String(warnings[0][1]), /^OSRM request failed/)
  })

  test('the motorbike profile stays off the Pasteur toll road', async ({ assert }) => {
    const pasteur = { lat: -6.8925, lng: 107.58 }
    const baros = { lat: -6.8975, lng: 107.5375 }
    const response = await fetch(
      `${LOCAL_OSRM}/route/v1/driving/${pasteur.lng},${pasteur.lat};${baros.lng},${baros.lat}?steps=true&overview=false`
    )
    const body = (await response.json()) as {
      code: string
      routes: {
        legs: { steps: { name: string; intersections: { classes?: string[] }[] }[] }[]
      }[]
    }
    assert.equal(body.code, 'Ok')
    const steps = body.routes[0].legs.flatMap((leg) => leg.steps)
    const classes = steps.flatMap((step) =>
      step.intersections.flatMap((intersection) => intersection.classes ?? [])
    )
    assert.notInclude(classes, 'motorway')
    assert.notInclude(classes, 'toll')
    assert.isFalse(
      steps.some((step) => /\btol\b/i.test(step.name)),
      steps.map((step) => step.name).join(' > ')
    )
  }).skip(
    async () => !(await isLocalOsrmUp()),
    `needs the local osrm-routed with storage/osrm at ${LOCAL_OSRM}`
  )
})
