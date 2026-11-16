import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import { Role } from '#enums/role_enum'
import env from '#start/env'
import { normalizePhone } from '#helpers/phone'

export default class extends BaseSeeder {
  override async run() {
    const adminEnvPhone = env.get('ADMIN_PHONE')
    if (!adminEnvPhone && env.get('NODE_ENV') === 'production') {
      throw new Error('Variabel lingkungan ADMIN_PHONE wajib disetel di lingkungan produksi.')
    }
    const adminPhone = normalizePhone(adminEnvPhone || '081298765432')

    await User.updateOrCreate(
      { phone: adminPhone },
      {
        fullName: 'Budi Santoso',
        password: 'password123',
        role: Role.ADMIN,
        isActive: true,
      }
    )

    await User.updateOrCreate(
      { phone: normalizePhone('081312345678') },
      {
        fullName: 'Siti Rahmawati',
        password: 'password123',
        role: Role.STAFF,
        isActive: true,
      }
    )

    await User.updateOrCreate(
      { phone: normalizePhone('081387654321') },
      {
        fullName: 'Ahmad Fauzi',
        password: 'password123',
        role: Role.STAFF,
        isActive: true,
      }
    )

    await User.updateOrCreate(
      { phone: normalizePhone('082111223344') },
      {
        fullName: 'Rina Wulandari',
        password: 'password123',
        role: Role.CUSTOMER,
        isActive: true,
      }
    )

    await User.updateOrCreate(
      { phone: normalizePhone('085299887766') },
      {
        fullName: 'Dimas Prasetyo',
        password: 'password123',
        role: Role.CUSTOMER,
        isActive: true,
      }
    )

    await User.updateOrCreate(
      { phone: normalizePhone('087812345670') },
      {
        fullName: 'Eko Wahyudi',
        password: 'password123',
        role: Role.CUSTOMER,
        isActive: false,
      }
    )

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
