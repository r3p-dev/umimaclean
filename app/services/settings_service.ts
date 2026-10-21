import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { DateTime } from 'luxon'
import { OrderStatus } from '#enums/order_enum'
import Setting from '#models/setting'
import { SERVICE_ZONE } from '#validators/shared/rules/pickup'

export type StoreInfo = { name: string; whatsapp: string; address: string; hours: string }

export type PickupSlotSetting = { label: string; capacity: number; on: boolean }

export type PaymentMethodSettings = { qris: boolean; cash: boolean; edc: boolean }

export type SettingValues = {
  store: StoreInfo
  pickup_slots: PickupSlotSetting[]
  payment_methods: PaymentMethodSettings
  inactive_days: number
}

export type SettingKey = keyof SettingValues

export const SLOT_CAPACITY = { min: 1, max: 20 } as const

export const DEFAULT_SETTINGS: SettingValues = {
  store: {
    name: 'Umima Clean',
    whatsapp: '6285157900974',
    address: 'Jl. Margacinta No. 132, Margasari, Buahbatu, Kota Bandung 40286',
    hours: 'Senin–Sabtu · 09.00–20.00',
  },
  pickup_slots: [
    { label: '09.00–12.00', capacity: 6, on: true },
    { label: '12.00–15.00', capacity: 6, on: true },
    { label: '15.00–18.00', capacity: 4, on: true },
  ],
  payment_methods: { qris: true, cash: true, edc: true },
  inactive_days: 60,
}

export type SlotAvailability = {
  slot: number
  label: string
  capacity: number
  booked: number
  isOpen: boolean
  isFull: boolean
}

export default class SettingsService {
  async get<Key extends SettingKey>(
    key: Key,
    transaction?: TransactionClientContract
  ): Promise<SettingValues[Key]> {
    const row = await Setting.query({ client: transaction }).where('key', key).first()
    return (row?.value as SettingValues[Key] | undefined) ?? DEFAULT_SETTINGS[key]
  }

  async all(): Promise<SettingValues> {
    const rows = await Setting.all()
    const stored = Object.fromEntries(rows.map((row) => [row.key, row.value]))
    return { ...DEFAULT_SETTINGS, ...stored } as SettingValues
  }

  async put<Key extends SettingKey>(
    key: Key,
    value: SettingValues[Key],
    transaction?: TransactionClientContract
  ) {
    await Setting.updateOrCreate({ key }, { value }, { client: transaction })
  }

  async availability(from: string, to: string, transaction?: TransactionClientContract) {
    const slots = await this.get('pickup_slots', transaction)
    const rows = await (transaction ?? db)
      .from('orders')
      .whereBetween('pickup_date', [from, to])
      .whereNot('status', OrderStatus.CANCELLED)
      .whereNotNull('pickup_slot')
      .select(db.raw(`to_char(pickup_date, 'YYYY-MM-DD') as day`), 'pickup_slot')
      .count('* as total')
      .groupBy('pickup_date', 'pickup_slot')

    const booked = new Map<string, number>()
    for (const row of rows) {
      booked.set(`${row.day}:${row.pickup_slot}`, Number(row.total))
    }

    return (date: string): SlotAvailability[] =>
      slots.map((setting, slot) => {
        const count = booked.get(`${date}:${slot}`) ?? 0
        return {
          slot,
          label: setting.label,
          capacity: setting.capacity,
          booked: count,
          isOpen: setting.on,
          isFull: count >= setting.capacity,
        }
      })
  }

  async upcomingAvailability(days = 7) {
    const today = DateTime.now().setZone(SERVICE_ZONE).startOf('day')
    const from = today.plus({ days: 1 }).toISODate()!
    const to = today.plus({ days }).toISODate()!
    const lookup = await this.availability(from, to)
    const result: Record<string, SlotAvailability[]> = {}
    for (let offset = 1; offset <= days; offset++) {
      const date = today.plus({ days: offset }).toISODate()!
      result[date] = lookup(date)
    }
    return result
  }
}

export const STORE_POINT = { lat: -6.955631, lng: 107.6539748 }
