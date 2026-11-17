import app from '@adonisjs/core/services/app'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class IndexSeeder extends BaseSeeder {
  async #seed(seederModule: { default: typeof BaseSeeder }) {
    await new seederModule.default(this.client).run()
  }

  override async run() {
    await this.#seed(await import('#database/seeders/user_seeder'))
    await this.#seed(await import('#database/seeders/setting_seeder'))
    await this.#seed(await import('#database/seeders/service_seeder'))
    await this.#seed(await import('#database/seeders/service_area_seeder'))

    // Tests seed on almost every run and production must not print demo passwords.
    if (app.inDev) {
      console.log(`
================================================================
Akun Demo Umima Clean:
----------------------------------------------------------------
Pemilik (Owner) : 081298765432 / password123 -> /staf/masuk
Staf 1          : 081312345678 / password123 -> /staf/masuk
Staf 2          : 081387654321 / password123 -> /staf/masuk
Pelanggan 1     : 082111223344 / password123 -> /masuk
Pelanggan 2     : 085299887766 / password123 -> /masuk
Akun Nonaktif   : 087812345670 / password123 (dinonaktifkan)
================================================================
`)
    }
  }
}
