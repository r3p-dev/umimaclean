import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Setting, { DEFAULT_SETTINGS, type SettingKey } from '#models/setting'

export default class extends BaseSeeder {
  override async run() {
    for (const key of Object.keys(DEFAULT_SETTINGS) as SettingKey[]) {
      await Setting.put(key, DEFAULT_SETTINGS[key])
    }
  }
}
