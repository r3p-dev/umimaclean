import app from '@adonisjs/core/services/app'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { demoAccountsBanner } from '#database/seeders/user_seeder'

export default class IndexSeeder extends BaseSeeder {
  async #seed(seederModule: { default: typeof BaseSeeder }) {
    await new seederModule.default(this.client).run()
  }

  override async run() {
    await this.#seed(await import('#database/seeders/user_seeder'))
    await this.#seed(await import('#database/seeders/setting_seeder'))
    await this.#seed(await import('#database/seeders/pickup_slot_seeder'))
    await this.#seed(await import('#database/seeders/service_seeder'))
    await this.#seed(await import('#database/seeders/service_area_seeder'))

    // Tests seed on almost every run and production must not print demo passwords.
    if (app.inDev) {
      console.log(demoAccountsBanner())
    }
  }
}
