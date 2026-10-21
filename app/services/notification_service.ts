import { inject } from '@adonisjs/core'
import { DateTime } from 'luxon'
import { MessagePurpose, MessageStatus } from '#enums/message_enum'
import type Order from '#models/order'
import type User from '#models/user'
import WhatsappMessage from '#models/whatsapp_message'
import FonnteService from '#services/fonnte_service'
import SettingsService from '#services/settings_service'
import env from '#start/env'
import { SERVICE_ZONE } from '#validators/shared/rules/pickup'

export function formatRupiah(amount: number) {
  return 'Rp' + amount.toLocaleString('id-ID')
}

export function orderLink(order: Order, path = '') {
  return `${env.get('APP_URL')}/pesanan/${order.publicCode}${path}`
}

function itemsText(order: Order) {
  return [
    [order.itemsSepatu, 'Sepatu'],
    [order.itemsTas, 'Tas'],
    [order.itemsHelm, 'Helm'],
  ]
    .filter(([count]) => Number(count) > 0)
    .map(([count, label]) => `${label} ×${count}`)
    .join(', ')
}

export function deliveryNote(status: MessageStatus, who = 'Pelanggan') {
  if (status === MessageStatus.SENT) {
    return `${who} diberi tahu via WhatsApp.`
  }
  if (status === MessageStatus.LOGGED) {
    return 'WhatsApp belum dikonfigurasi, pesan hanya dicatat di log server.'
  }
  return `WhatsApp ke ${who.toLowerCase()} gagal terkirim.`
}

@inject()
export default class NotificationService {
  constructor(
    protected fonnte: FonnteService,
    protected settings: SettingsService
  ) {}

  async send(message: {
    target: string
    purpose: MessagePurpose
    text: string
    orderId?: number | null
    userId?: number | null
  }) {
    const status = await this.fonnte.send(message.target, message.text)
    await WhatsappMessage.create({
      target: message.target,
      purpose: message.purpose,
      status,
      orderId: message.orderId ?? null,
      userId: message.userId ?? null,
    })
    return status
  }

  async toCustomer(order: Order, purpose: MessagePurpose, detail = '') {
    if (!order.customerPhone) {
      return MessageStatus.FAILED
    }
    return this.send({
      target: order.customerPhone,
      purpose,
      text: await this.#customerText(order, purpose, detail),
      orderId: order.id,
      userId: order.userId,
    })
  }

  async toShop(order: Order, purpose: MessagePurpose, detail = '') {
    const store = await this.settings.get('store')
    return this.send({
      target: store.whatsapp,
      purpose,
      text: this.#shopText(order, purpose, detail),
      orderId: order.id,
    })
  }

  async toUser(user: User, purpose: MessagePurpose, text: string) {
    return this.send({ target: user.phone, purpose, text, userId: user.id })
  }

  async #customerText(order: Order, purpose: MessagePurpose, detail: string) {
    const code = order.publicCode
    const greeting = `Halo ${order.customerName.split(' ')[0] || 'Kak'},`
    const store = await this.settings.get('store')
    switch (purpose) {
      case MessagePurpose.COURIER_ON_THE_WAY:
        return `${greeting} kurir ${detail} sedang menuju lokasi Anda untuk menjemput pesanan ${code}.`
      case MessagePurpose.PICKED_UP:
        return `${greeting} barang pesanan ${code} sudah kami terima. Kami periksa dulu, lalu tagihan dikirim lewat WhatsApp ini.`
      case MessagePurpose.PICKUP_SKIPPED:
        return `${greeting} kurir belum bisa menjemput pesanan ${code} (${detail}). Kami akan menghubungi Anda untuk jadwal ulang. Balas pesan ini bila ada pertanyaan.`
      case MessagePurpose.BILL_READY:
        return `${greeting} barang pesanan ${code} sudah diperiksa. Total tagihan ${detail}. Lihat rincian dan bayar dengan QRIS: ${orderLink(order, '/tagihan')}`
      case MessagePurpose.PAID:
        return `${greeting} pembayaran pesanan ${code} sebesar ${detail} sudah kami terima. Barang Anda mulai dicuci.`
      case MessagePurpose.OUT_FOR_DELIVERY:
        return `${greeting} pesanan ${code} sedang diantar oleh ${detail}. Mohon pastikan ada yang menerima di lokasi.`
      case MessagePurpose.DELIVERY_SKIPPED:
        return `${greeting} pengantaran pesanan ${code} tertunda (${detail}). Kami akan menghubungi Anda untuk jadwal ulang.`
      case MessagePurpose.READY_FOR_COLLECTION:
        return `${greeting} pesanan ${code} sudah selesai dicuci dan siap diambil di ${store.name}, ${store.address} (${store.hours}).`
      case MessagePurpose.ORDER_CANCELLED:
        return `${greeting} pesanan ${code} dibatalkan oleh ${store.name}. Alasan: ${detail}. Hubungi kami bila ada pertanyaan.`
      case MessagePurpose.RECEIPT:
        return `Struk ${store.name}\n${detail}\nTerima kasih!`
      default:
        return `${greeting} ada pembaruan untuk pesanan ${code}: ${detail}`
    }
  }

  #shopText(order: Order, purpose: MessagePurpose, detail: string) {
    const code = order.publicCode
    if (purpose === MessagePurpose.CUSTOMER_CANCELLED) {
      return `Pesanan ${code} (${order.customerName}) dibatalkan pelanggan. Alasan: ${detail}.`
    }
    const date = order.pickupDate
      ? DateTime.fromISO(order.pickupDate.toISODate()!, { zone: SERVICE_ZONE })
          .setLocale('id')
          .toFormat('ccc, d LLL')
      : '-'
    return `Pesanan baru ${code} dari ${order.customerName} (${order.customerPhone}). Jemput ${date} ${detail}. Barang: ${itemsText(order)}.`
  }
}
