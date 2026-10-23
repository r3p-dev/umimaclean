import { BaseSeeder } from '@adonisjs/lucid/seeders'
import SettingsService, { DEFAULT_SETTINGS, type SettingKey } from '#services/settings_service'

export default class extends BaseSeeder {
  override async run() {
    const settings = new SettingsService()
    for (const key of Object.keys(DEFAULT_SETTINGS) as SettingKey[]) {
      await settings.put(key, DEFAULT_SETTINGS[key])
    }
  }
}
