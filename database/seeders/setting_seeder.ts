import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Setting from '#models/setting'
import { DEFAULT_SETTINGS, type SettingKey } from '#services/setting_service'

export default class SettingSeeder extends BaseSeeder {
  override async run() {
    for (const key of Object.keys(DEFAULT_SETTINGS) as SettingKey[]) {
      await Setting.updateOrCreate(
        { key },
        {
          value: DEFAULT_SETTINGS[key],
        }
      )
    }
  }
}
