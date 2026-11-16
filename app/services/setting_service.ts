import { inject } from '@adonisjs/core'
import ActivityLog from '#models/activity_log'
import Setting from '#models/setting'
import type User from '#models/user'
import { storeSettingValidator, pickupSlotsArrayValidator } from '#validators/setting_validator'

export interface StoreInfoSetting {
  [key: string]: string
  name: string
  whatsapp: string
  address: string
  hours: string
}

export interface PickupSlotSetting {
  id: string
  label: string
  capacity: number
  isActive: boolean
}

export interface SettingValues {
  store: StoreInfoSetting
  pickup_slots: PickupSlotSetting[]
}

export type SettingKey = keyof SettingValues

export const DEFAULT_STORE_SETTING: StoreInfoSetting = {
  name: 'Umima Clean',
  whatsapp: '6285157900974',
  address: 'Jl. Margacinta No. 132, Margasari, Buahbatu, Kota Bandung 40286',
  hours: 'Senin–Sabtu · 09.00–20.00',
}

export const DEFAULT_PICKUP_SLOTS: PickupSlotSetting[] = [
  { id: 'slot-1', label: '09.00–12.00', capacity: 6, isActive: true },
  { id: 'slot-2', label: '12.00–15.00', capacity: 6, isActive: true },
  { id: 'slot-3', label: '15.00–18.00', capacity: 4, isActive: true },
]

export const DEFAULT_SETTINGS: SettingValues = {
  store: DEFAULT_STORE_SETTING,
  pickup_slots: DEFAULT_PICKUP_SLOTS,
}

@inject()
export default class SettingService {
  async getStoreSettings(): Promise<StoreInfoSetting> {
    const row = await Setting.findBy('key', 'store')
    const raw = row?.value ?? DEFAULT_STORE_SETTING
    return storeSettingValidator.validate(raw)
  }

  async getPickupSlots(): Promise<PickupSlotSetting[]> {
    const row = await Setting.findBy('key', 'pickup_slots')
    const raw = row?.value ?? DEFAULT_PICKUP_SLOTS
    return pickupSlotsArrayValidator.validate(raw)
  }

  async updateStoreSettings(actor: User, payload: unknown): Promise<StoreInfoSetting> {
    const current = await this.getStoreSettings()
    const validated = await storeSettingValidator.validate(payload)

    await Setting.updateOrCreate({ key: 'store' }, { value: validated })

    const diffs: string[] = []
    if (current.name !== validated.name) {
      diffs.push(`Nama: "${current.name}" → "${validated.name}"`)
    }
    if (current.whatsapp !== validated.whatsapp) {
      diffs.push(`WhatsApp: ${current.whatsapp} → ${validated.whatsapp}`)
    }
    if (current.address !== validated.address) {
      diffs.push(`Alamat: "${current.address}" → "${validated.address}"`)
    }
    if (current.hours !== validated.hours) {
      diffs.push(`Jam buka: "${current.hours}" → "${validated.hours}"`)
    }

    const description =
      diffs.length > 0
        ? `Mengubah pengaturan toko (${diffs.join(', ')})`
        : 'Memperbarui pengaturan toko'

    await ActivityLog.create({
      userId: actor.id,
      category: 'settings',
      action: 'settings.store.update',
      description,
      isSensitive: false,
    })

    return validated
  }

  async updatePickupSlots(actor: User, payload: unknown): Promise<PickupSlotSetting[]> {
    const validated = await pickupSlotsArrayValidator.validate(payload)

    await Setting.updateOrCreate({ key: 'pickup_slots' }, { value: validated })

    await ActivityLog.create({
      userId: actor.id,
      category: 'settings',
      action: 'settings.slots.update',
      description: `Memperbarui jadwal slot penjemputan (${validated.length} slot)`,
      isSensitive: false,
    })

    return validated
  }
}
