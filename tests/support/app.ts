import { randomUUID } from 'node:crypto'
import type { ApiClient } from '@japa/api-client'
import app from '@adonisjs/core/services/app'
import testUtils from '@adonisjs/core/services/test_utils'
import limiter from '@adonisjs/limiter/services/main'
import type { SessionData } from '@adonisjs/session/types'
import type { Group } from '@japa/runner/core'
import { DateTime } from 'luxon'
import { MessageStatus } from '#enums/message_enum'
import { ItemKind, OrderAddressType } from '#enums/order_enum'
import { ServiceType } from '#enums/service_enum'
import Service from '#models/service'
import MidtransGateway, { type ChargeInput, type ProviderStatus } from '#services/midtrans_gateway'
import { CustomerAddressFactory } from '#database/factories/customer_address_factory'
import { OrderAddressFactory } from '#database/factories/order_address_factory'
import { OrderFactory } from '#database/factories/order_factory'
import type User from '#models/user'
import FonnteService from '#services/fonnte_service'
import AreaService, { type GeocodedAddress } from '#services/area_service'
import TurnstileService from '#services/turnstile_service'
import { SERVICE_ZONE } from '#validators/shared/rules/pickup'

export class FakeGeocoder extends AreaService {
  address: GeocodedAddress | null = { city: 'Kota Bandung', district: 'Coblong' }

  override async reverse() {
    return this.address
  }
}

export class FakeFonnte extends FonnteService {
  messages: { target: string; message: string }[] = []
  shouldFail = false

  override async send(target: string, message: string) {
    if (this.shouldFail) {
      return MessageStatus.FAILED
    }
    this.messages.push({ target, message })
    return MessageStatus.SENT
  }

  lastCode(target: string) {
    const sent = this.messages.filter((message) => message.target === target).at(-1)
    const code = sent?.message.match(/\b(\d{6})\b/)?.[1]
    if (!code) {
      throw new Error(`No OTP sent to ${target}`)
    }
    return code
  }
}

export class FakeTurnstile extends TurnstileService {
  shouldPass = true
  hasWidget = true

  override async verify(token: unknown) {
    if (!this.hasWidget) {
      return this.shouldPass
    }

    return this.shouldPass && typeof token === 'string' && token.length > 0
  }
}

export class FakePaymentGateway extends MidtransGateway {
  isAvailable = true
  charges: ChargeInput[] = []
  providerStatus: ProviderStatus | null = null

  override isConfigured() {
    return this.isAvailable
  }

  override async charge(input: ChargeInput) {
    this.charges.push(input)
    return { transactionId: `tx-${input.orderId}`, qrUrl: `https://qr.test/${input.orderId}.png` }
  }

  override async status() {
    return this.providerStatus
  }

  override verify(notification: ProviderStatus) {
    return notification.signatureKey === 'valid-signature'
  }
}

export const TURNSTILE_TOKEN = 'XXXX.DUMMY.TOKEN.XXXX'

export const PNG_PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
)

export async function seedCatalogue() {
  return Service.createMany([
    { name: 'Deep Clean', type: ServiceType.MAIN, categories: [ItemKind.SHOE], price: 45000 },
    { name: 'Whitening', type: ServiceType.ADDON, categories: [ItemKind.SHOE], price: 10000 },
    { name: 'Cuci Tas', type: ServiceType.MAIN, categories: [ItemKind.BAG], price: 40000 },
    { name: 'Helmet Spa', type: ServiceType.MAIN, categories: [ItemKind.HELMET], price: 35000 },
  ])
}

export function useApp(group: Group) {
  const state = {
    geocoder: new FakeGeocoder(),
    fonnte: new FakeFonnte(),
    turnstile: new FakeTurnstile(),
    gateway: new FakePaymentGateway(),
  }
  group.each.setup(async () => {
    state.geocoder = new FakeGeocoder()
    state.fonnte = new FakeFonnte()
    state.turnstile = new FakeTurnstile()
    state.gateway = new FakePaymentGateway()
    app.container.swap(AreaService, () => state.geocoder)
    app.container.swap(FonnteService, () => state.fonnte)
    app.container.swap(TurnstileService, () => state.turnstile)
    app.container.swap(MidtransGateway, () => state.gateway)
    await limiter.clear()
    const truncate = await testUtils.db().truncate()
    await truncate()
    return truncate
  })
  group.each.teardown(() => {
    app.container.restore(AreaService)
    app.container.restore(FonnteService)
    app.container.restore(TurnstileService)
    app.container.restore(MidtransGateway)
  })
  return state
}

export function send(
  client: ApiClient,
  method: 'post' | 'put' | 'delete',
  url: string,
  body: object = {},
  session: SessionData = {}
) {
  return client[method](url)
    .json(body)
    .withSession(session)
    .withCsrfToken()
    .header('accept', 'application/json')
    .redirects(0)
}

export function post(client: ApiClient, url: string, body: object = {}, session: SessionData = {}) {
  return send(client, 'post', url, body, session)
}

export function inertia(client: ApiClient, url: string, session: SessionData = {}) {
  return client.get(url).withSession(session).withInertia().redirects(0)
}

export function nextPickupDate() {
  let date = DateTime.now().setZone(SERVICE_ZONE).plus({ days: 1 })
  if (date.weekday === 7) {
    date = date.plus({ days: 1 })
  }
  return date.toISODate()!
}

export function orderPayload(pickupAddressId: number, overrides: Record<string, unknown> = {}) {
  return {
    key: randomUUID(),
    items: { sepatu: 2, tas: 0, helm: 1 },
    note: 'Noda kopi',
    date: nextPickupDate(),
    slot: 1,
    pickupAddressId,
    ...overrides,
  }
}

export function addressPayload(overrides: Record<string, unknown> = {}) {
  return {
    label: 'Kantor',
    recipientName: 'Budi Santoso',
    addressText: 'Jl. Asia Afrika No. 8, Lt. 3, Braga, Sumur Bandung',
    landmark: 'Resepsionis',
    point: { lat: -6.9215, lng: 107.6094 },
    ...overrides,
  }
}

export function savedAddress(user: User, overrides: Record<string, unknown> = {}) {
  return CustomerAddressFactory.merge({
    userId: user.id,
    recipientName: user.name,
    ...overrides,
  }).create()
}

export async function createOrder(
  user: User,
  overrides: Record<string, unknown> = {},
  address = 'Jl. Dipati Ukur No. 35, Coblong, Bandung'
) {
  const order = await OrderFactory.merge({
    userId: user.id,
    customerName: user.name,
    customerPhone: user.phone,
    ...overrides,
  }).create()
  for (const type of Object.values(OrderAddressType)) {
    await OrderAddressFactory.merge({
      orderId: order.id,
      type,
      addressText: address,
      recipientName: user.name,
      recipientPhone: user.phone,
    }).create()
  }
  return order
}
