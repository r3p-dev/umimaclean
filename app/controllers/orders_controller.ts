import { randomUUID } from 'node:crypto'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { MAX_ADDRESSES } from '#models/customer_address'
import PickupSlot from '#models/pickup_slot'
import AddressService from '#services/address_service'
import OrderService from '#services/order_service'
import PickupSlotService from '#services/pickup_slot_service'
import AddressTransformer from '#transformers/address_transformer'
import { confirmOrderValidator, createOrderValidator } from '#validators/order_validator'

export type SessionOrderDraft = {
  items: { itemKind: string; brand?: string; type: string; size: string }[]
  pickupAddressId: number
  deliveryAddressId: number
  pickupDate: string
  pickupSlotId: number
  note?: string
}

const DRAFT_SESSION_KEY = 'order_draft'

// CUST-5, CUST-6: the customer's online order flow (`/pesan` and `/pesan/konfirmasi`).
@inject()
export default class OrdersController {
  constructor(
    protected addressService: AddressService,
    protected orderService: OrderService,
    protected pickupSlotService: PickupSlotService
  ) {}

  async create({ auth, request, inertia, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const addresses = await this.addressService.listAddresses(user)
    const dates = await this.pickupSlotService.listPickupDates()
    const slotsByDate = Object.fromEntries(
      await Promise.all(
        dates.map(async (date) => {
          const slots = await this.pickupSlotService.listSlotsForDate(date)
          return [
            date,
            slots.map(({ slot, taken, isAvailable }) => ({
              id: slot.id,
              startsAt: slot.startsAt,
              endsAt: slot.endsAt,
              capacity: slot.capacity,
              isActive: slot.isActive,
              taken,
              isAvailable,
            })),
          ]
        })
      )
    )

    const ulangRaw = request.qs().ulang
    const ulangId = ulangRaw !== undefined ? Number(ulangRaw) : Number.NaN
    const repeatItems =
      Number.isInteger(ulangId) && ulangId > 0
        ? await this.orderService.listRepeatItems(user, ulangId)
        : null

    return inertia.render('customer/orders/create', {
      addresses: AddressTransformer.transform(addresses),
      canAddAddress: addresses.length < MAX_ADDRESSES,
      dates,
      slotsByDate,
      draft: (session.get(DRAFT_SESSION_KEY) as SessionOrderDraft | undefined) ?? null,
      repeatItems,
    })
  }

  async storeDraft({ auth, request, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(createOrderValidator)
    await this.orderService.validateDraft(user, payload)

    const draft: SessionOrderDraft = {
      items: payload.items.map((item) => ({
        itemKind: item.itemKind,
        brand: item.brand || undefined,
        type: item.type,
        size: item.size,
      })),
      pickupAddressId: payload.pickupAddressId,
      deliveryAddressId: payload.deliveryAddressId,
      pickupDate: payload.pickupDate.toISODate()!,
      pickupSlotId: payload.pickupSlotId,
      note: payload.note || undefined,
    }
    session.put(DRAFT_SESSION_KEY, draft)
    return response.redirect().toRoute('customer.orders.confirm')
  }

  async confirm({ auth, inertia, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const draft = session.get(DRAFT_SESSION_KEY) as SessionOrderDraft | undefined
    if (!draft) {
      return response.redirect().toRoute('customer.orders.create')
    }

    const [pickupAddress, deliveryAddress, slot] = await Promise.all([
      this.addressService.findAddressOf(user, draft.pickupAddressId).catch(() => null),
      this.addressService.findAddressOf(user, draft.deliveryAddressId).catch(() => null),
      PickupSlot.find(draft.pickupSlotId),
    ])
    if (!pickupAddress || !deliveryAddress || !slot) {
      session.forget(DRAFT_SESSION_KEY)
      return response.redirect().toRoute('customer.orders.create')
    }

    return inertia.render('customer/orders/confirm', {
      draft,
      pickupAddress: AddressTransformer.transform(pickupAddress),
      deliveryAddress: AddressTransformer.transform(deliveryAddress),
      slot: { id: slot.id, startsAt: slot.startsAt, endsAt: slot.endsAt },
      requestKey: randomUUID(),
    })
  }

  async store({ auth, request, response, session }: HttpContext) {
    const rawDraft = session.get(DRAFT_SESSION_KEY) as SessionOrderDraft | undefined
    if (!rawDraft) {
      session.flash('error', 'Sesi pesanan berakhir. Silakan isi pesanan lagi.')
      return response.redirect().toRoute('customer.orders.create')
    }

    const { requestKey } = await request.validateUsing(confirmOrderValidator)
    const draft = await createOrderValidator.validate(rawDraft)
    const order = await this.orderService.placeOnlineOrder(auth.getUserOrFail(), draft, requestKey)

    session.forget(DRAFT_SESSION_KEY)
    session.flash('success', `Pesanan ${order.number()} diterima`)
    return response.redirect().toRoute('customer.home')
  }
}
