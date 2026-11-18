import { inject } from '@adonisjs/core'
import ActivityLog from '#models/activity_log'
import Setting from '#models/setting'
import type User from '#models/user'
import { openingHoursValidator, storeSettingValidator } from '#validators/setting_validator'

export interface StoreInfoSetting {
  [key: string]: string
  name: string
  whatsapp: string
  address: string
}

export type OpeningHoursSetting = {
  days: { day: number; isOpen: boolean; opens: string; closes: string }[]
  // Local Asia/Jakarta date and time, "2026-11-19T20:00" (D103).
  closure: {
    isClosed: boolean
    startsAt: string | null
    endsAt: string | null
    note: string | null
  }
}

export interface SettingValues {
  store: StoreInfoSetting
  opening_hours: OpeningHoursSetting
}

export type SettingKey = keyof SettingValues

export const DEFAULT_STORE_SETTING: StoreInfoSetting = {
  name: 'Umima Clean',
  whatsapp: '6285157900974',
  address: 'Jl. Margacinta No. 132, Margasari, Buahbatu, Kota Bandung 40286',
}

// Monday to Saturday 09.00–20.00, closed on Sunday.
export const DEFAULT_OPENING_HOURS: OpeningHoursSetting = {
  days: [1, 2, 3, 4, 5, 6, 7].map((day) => ({
    day,
    isOpen: day !== 7,
    opens: '09:00',
    closes: '20:00',
  })),
  closure: { isClosed: false, startsAt: null, endsAt: null, note: null },
}

export const DEFAULT_SETTINGS: SettingValues = {
  store: DEFAULT_STORE_SETTING,
  opening_hours: DEFAULT_OPENING_HOURS,
}

@inject()
export default class SettingService {
  async getStoreSettings(): Promise<StoreInfoSetting> {
    const row = await Setting.findBy('key', 'store')
    const raw = row?.value ?? DEFAULT_STORE_SETTING
    return storeSettingValidator.validate(raw)
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

  async getOpeningHours(): Promise<OpeningHoursSetting> {
    const row = await Setting.findBy('key', 'opening_hours')
    return openingHoursValidator.validate(row?.value ?? DEFAULT_OPENING_HOURS)
  }

  async updateOpeningHours(actor: User, payload: unknown): Promise<OpeningHoursSetting> {
    const validated = await openingHoursValidator.validate(payload)
    validated.days.sort((first, second) => first.day - second.day)

    await Setting.updateOrCreate({ key: 'opening_hours' }, { value: validated })

    const { closure: window } = validated
    const closure = window.isClosed
      ? `tutup sementara ${window.startsAt?.replace('T', ' ')} sampai ${window.endsAt?.replace('T', ' ')}`
      : 'buka seperti jadwal'
    await ActivityLog.create({
      userId: actor.id,
      category: 'settings',
      action: 'settings.hours.update',
      description: `Memperbarui jam buka (${closure})`,
      isSensitive: false,
    })

    return validated
  }
}
