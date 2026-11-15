import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class extends BaseSeeder {
  override async run() {
    await User.updateOrCreate(
      { phone: '6281200000001' },
      {
        fullName: 'Budi Santoso (Pemilik)',
        password: 'password123',
        role: 'admin',
        isActive: true,
      }
    )

    await User.updateOrCreate(
      { phone: '6281200000002' },
      {
        fullName: 'Asep Hidayat (Staf Kurir)',
        password: 'password123',
        role: 'staff',
        isActive: true,
      }
    )

    await User.updateOrCreate(
      { phone: '6281200000003' },
      {
        fullName: 'Dewi Lestari (Staf Workshop)',
        password: 'password123',
        role: 'staff',
        isActive: true,
      }
    )

    await User.updateOrCreate(
      { phone: '6281200000010' },
      {
        fullName: 'Rina Wulandari',
        password: 'password123',
        role: 'customer',
        isActive: true,
      }
    )

    await User.updateOrCreate(
      { phone: '6281200000011' },
      {
        fullName: 'Dimas Prasetyo',
        password: 'password123',
        role: 'customer',
        isActive: true,
      }
    )

    await User.updateOrCreate(
      { phone: '6281200000099' },
      {
        fullName: 'Doni Nonaktif',
        password: 'password123',
        role: 'customer',
        isActive: false,
      }
    )

    console.log(`
================================================================
Akun Demo Umima Clean:
----------------------------------------------------------------
Pemilik (Admin) : 081200000001 / password123 -> /staf/masuk
Staf Kurir      : 081200000002 / password123 -> /staf/masuk
Staf Workshop   : 081200000003 / password123 -> /staf/masuk
Pelanggan 1     : 081200000010 / password123 -> /masuk
Pelanggan 2     : 081200000011 / password123 -> /masuk
Akun Nonaktif   : 081200000099 / password123 (dinonaktifkan)
================================================================
`)
  }
}
