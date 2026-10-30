import { test } from '@japa/runner'
import type { ApiClient } from '@japa/api-client'
import app from '@adonisjs/core/services/app'
import { DateTime } from 'luxon'
import { UserFactory } from '#database/factories/user_factory'
import { OrderStatus } from '#enums/order_enum'
import { straightMeters } from '#helpers/route'
import type Order from '#models/order'
import OrderAddress from '#models/order_address'
import type { Point } from '#models/service_area'
import { STORE_POINT } from '#models/setting'
import type User from '#models/user'
import OsrmGateway from '#services/osrm_gateway'
import { SERVICE_ZONE } from '#validators/shared/rules/pickup'
import { PNG_PIXEL, createOrder, inertia, post, useApp } from '#tests/support/app'

class FakeOsrm extends OsrmGateway {
  tables: Point[][] = []
  shouldFail = false

  override async findDurations(points: Point[]) {
    this.tables.push(points)
    if (this.shouldFail) {
      throw new Error('OSRM down')
    }
    return points.map((from) => points.map((to) => straightMeters(from, to) / 8))
  }
}

const LAT = STORE_POINT.lat
const today = () => DateTime.now().setZone(SERVICE_ZONE).startOf('day')

type Board = { tasks: { ref: string }[]; isOptimized: boolean }

async function board(client: ApiClient, user: User, kind = 'jemput', position?: number) {
  const request = inertia(client, `/staf/${kind}`).loginAs(user)
  if (position !== undefined) {
    request.header('x-courier-position', `${LAT.toFixed(3)},${position.toFixed(3)}`)
  }
  const response = await request
  response.assertStatus(200)
  return response.inertiaProps as Board
}

function refs(result: Board) {
  return result.tasks.map((task) => task.ref)
}

test.group('Courier queue order', (group) => {
  useApp(group)
  let osrm: FakeOsrm
  let customer: User

  group.each.setup(async () => {
    osrm = new FakeOsrm()
    app.container.swap(OsrmGateway, () => osrm)
    customer = await UserFactory.create()
    return () => app.container.restore(OsrmGateway)
  })

  async function stop(
    lng: number,
    overrides: { pickupDate?: DateTime; pickupSlot?: number; status?: OrderStatus } = {}
  ): Promise<Order> {
    const order = await createOrder(customer, { pickupDate: today(), pickupSlot: 0, ...overrides })
    await OrderAddress.query().where('order_id', order.id).update({ lat: LAT, lng })
    return order
  }

  test('stops go nearest first inside each slot and never across slots', async ({
    client,
    assert,
  }) => {
    const far = await stop(107.7)
    const middle = await stop(107.68)
    const near = await stop(107.66, { pickupSlot: 1 })
    const staff = await UserFactory.apply('staff').create()

    const result = await board(client, staff)

    assert.isTrue(result.isOptimized)
    assert.deepEqual(refs(result), [middle.number(), far.number(), near.number()])
    assert.lengthOf(osrm.tables, 1)
    assert.deepEqual(osrm.tables[0][0], STORE_POINT)
    assert.lengthOf(osrm.tables[0], 4)
  })

  test('overdue pickups stay before today', async ({ client, assert }) => {
    const overdue = await stop(107.72, { pickupDate: today().minus({ days: 1 }), pickupSlot: 1 })
    const todays = await stop(107.66)
    const staff = await UserFactory.apply('staff').create()

    assert.deepEqual(refs(await board(client, staff)), [overdue.number(), todays.number()])
  })

  test('the courier position is the start, the store otherwise', async ({ client, assert }) => {
    const west = await stop(107.6)
    const east = await stop(107.7)
    const fromStore = await UserFactory.apply('staff').create()
    const fromWest = await UserFactory.apply('staff').create()

    assert.deepEqual(refs(await board(client, fromStore)), [east.number(), west.number()])
    assert.deepEqual(refs(await board(client, fromWest, 'jemput', 107.59)), [
      west.number(),
      east.number(),
    ])
    assert.deepEqual(osrm.tables[1][0], { lat: Number(LAT.toFixed(3)), lng: 107.59 })
  })

  test('the order holds on refresh and GPS moves and changes when orders arrive', async ({
    client,
    assert,
  }) => {
    const west = await stop(107.6)
    const east = await stop(107.7)
    const staff = await UserFactory.apply('staff').create()

    assert.deepEqual(refs(await board(client, staff, 'jemput', 107.59)), [
      west.number(),
      east.number(),
    ])
    assert.deepEqual(refs(await board(client, staff, 'jemput', 107.71)), [
      west.number(),
      east.number(),
    ])
    assert.lengthOf(osrm.tables, 1)

    const added = await stop(107.61)
    assert.deepEqual(refs(await board(client, staff, 'jemput', 107.71)), [
      east.number(),
      added.number(),
      west.number(),
    ])
    assert.lengthOf(osrm.tables, 2)
  })

  test('a skipped stop goes last and the rest keeps its order', async ({ client, assert }) => {
    const first = await stop(107.66)
    const second = await stop(107.68)
    const third = await stop(107.7)
    const staff = await UserFactory.apply('staff').create()
    assert.deepEqual(refs(await board(client, staff)), [
      first.number(),
      second.number(),
      third.number(),
    ])

    const started = await post(client, `/staf/jemput/${first.id}/mulai`).loginAs(staff)
    started.assertStatus(302)
    const skipped = await post(client, `/staf/jemput/${first.id}/lewati`, { reason: 0 }).loginAs(
      staff
    )
    skipped.assertStatus(302)
    await first.refresh()
    assert.equal(first.status, OrderStatus.AWAITING_PICKUP)

    assert.deepEqual(refs(await board(client, staff)), [
      second.number(),
      third.number(),
      first.number(),
    ])
  })

  test('after a completed stop the next plan starts from that stop', async ({ client, assert }) => {
    const west = await stop(107.6)
    const middle = await stop(107.64)
    const east = await stop(107.7)
    const staff = await UserFactory.apply('staff').create()
    assert.deepEqual(refs(await board(client, staff, 'jemput', 107.75)), [
      east.number(),
      middle.number(),
      west.number(),
    ])

    await post(client, `/staf/jemput/${west.id}/mulai`).loginAs(staff)
    const done = await client
      .post(`/staf/jemput/${west.id}/selesai`)
      .file('photo', PNG_PIXEL, { filename: 'bukti.png' })
      .withCsrfToken()
      .header('accept', 'application/json')
      .loginAs(staff)
      .redirects(0)
    done.assertStatus(302)
    await west.refresh()
    assert.equal(west.status, OrderStatus.PICKED_UP)

    assert.deepEqual(refs(await board(client, staff, 'jemput', 107.75)), [
      middle.number(),
      east.number(),
    ])
    assert.lengthOf(osrm.tables, 2)
    assert.deepEqual(osrm.tables[1][0], { lat: LAT, lng: 107.6 })
  })

  test('deliveries are ordered nearest first over the whole queue', async ({ client, assert }) => {
    const ready = { status: OrderStatus.READY_FOR_DELIVERY }
    const far = await stop(107.7, ready)
    const near = await stop(107.66, { ...ready, pickupSlot: 1 })
    const staff = await UserFactory.apply('staff').create()

    assert.deepEqual(refs(await board(client, staff, 'antar')), [near.number(), far.number()])
  })

  test('above the table limit the scheduled order is used without asking OSRM', async ({
    client,
    assert,
  }) => {
    const scheduled: Order[] = []
    for (let index = 0; index < 100; index++) {
      scheduled.push(await stop(107.7 - index * 0.0005))
    }
    const staff = await UserFactory.apply('staff').create()

    const result = await board(client, staff)

    assert.isFalse(result.isOptimized)
    assert.deepEqual(
      refs(result),
      scheduled.map((order) => order.number())
    )
    assert.lengthOf(osrm.tables, 0)
  })

  test('without OSRM the scheduled order stays and the board says so', async ({
    client,
    assert,
  }) => {
    osrm.shouldFail = true
    const far = await stop(107.7)
    const near = await stop(107.66)
    const staff = await UserFactory.apply('staff').create()

    const result = await board(client, staff)
    assert.isFalse(result.isOptimized)
    assert.deepEqual(refs(result), [far.number(), near.number()])

    app.container.restore(OsrmGateway)
    const other = await UserFactory.apply('staff').create()
    const retried = await board(client, other)
    assert.isFalse(retried.isOptimized)
  })
})
