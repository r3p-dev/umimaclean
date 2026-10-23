import { BaseSeeder } from '@adonisjs/lucid/seeders'
import AddressSeeder from '#database/seeders/address_seeder'
import OperatingCostSeeder from '#database/seeders/operating_cost_seeder'
import OrderSeeder from '#database/seeders/order_seeder'
import ServiceAreaSeeder from '#database/seeders/service_area_seeder'
import ServiceSeeder from '#database/seeders/service_seeder'
import SettingSeeder from '#database/seeders/setting_seeder'
import UserSeeder from '#database/seeders/user_seeder'

export default class extends BaseSeeder {
  static override environment = ['development']

  override async run() {
    for (const Seeder of [
      UserSeeder,
      AddressSeeder,
      ServiceSeeder,
      SettingSeeder,
      ServiceAreaSeeder,
      OrderSeeder,
      OperatingCostSeeder,
    ]) {
      await new Seeder(this.client).run()
    }
  }
}
