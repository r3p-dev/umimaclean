import logger from '@adonisjs/core/services/logger'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import AdminSeeder from '#database/seeders/admin_seeder'
import ServiceAreaSeeder from '#database/seeders/service_area_seeder'
import SettingSeeder from '#database/seeders/setting_seeder'
import { Role } from '#enums/role_enum'
import User from '#models/user'

export default class extends BaseSeeder {
  static override environment = ['production']

  override async run() {
    if (await User.query().where('role', Role.ADMIN).first()) {
      logger.info('Production data already seeded, skipping')
      return
    }

    for (const Seeder of [SettingSeeder, ServiceAreaSeeder, AdminSeeder]) {
      await new Seeder(this.client).run()
    }
  }
}
