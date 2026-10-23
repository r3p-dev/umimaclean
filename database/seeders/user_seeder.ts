import { randomBytes, randomUUID } from 'node:crypto'
import logger from '@adonisjs/core/services/logger'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import { Role } from '#enums/role_enum'
import User from '#models/user'

export const DEMO_PHONE = '6281223456789'

export const ACCOUNTS = [
  { role: Role.CUSTOMER, name: 'Rina Kartika', phone: DEMO_PHONE },
  { role: Role.CUSTOMER, name: 'Budi Santoso', phone: '6281234500000' },
  { role: Role.ADMIN, name: 'Umi Maryam', phone: '6281122001100' },
  { role: Role.STAFF, name: 'Dedi Supriadi', phone: '6281234567801' },
]

export const DEMO_CUSTOMERS = [
  ['Laras Putri', '6281223456701'],
  ['Fajar Nugraha', '6281223456702'],
  ['Siti Aminah', '6281223456703'],
  ['Dewi Lestari', '6281223456704'],
  ['Hendra Wijaya', '6281223456705'],
  ['Maya Sari', '6281223456706'],
  ['Indra Kusuma', '6281223456707'],
  ['Rudi Hartono', '6281223456708'],
  ['Nadia Putri', '6281223456709'],
  ['Teguh Prasetyo', '6281223456710'],
] as const

export default class extends BaseSeeder {
  override async run() {
    const password = randomBytes(9).toString('base64url')
    for (const account of ACCOUNTS) {
      const user = await User.findBy('phone', account.phone)
      await (user ?? new User())
        .merge({
          ...account,
          password,
          isActive: true,
          phoneVerifiedAt: user?.phoneVerifiedAt ?? DateTime.now(),
        })
        .save()
    }

    for (const [name, phone] of DEMO_CUSTOMERS) {
      await User.firstOrCreate(
        { phone },
        {
          role: Role.CUSTOMER,
          name,
          password: randomUUID(),
          phoneVerifiedAt: DateTime.now(),
        }
      )
    }

    const list = ACCOUNTS.map((account) => `${account.role} ${account.phone} (${account.name})`)
    logger.info(`Demo accounts, password "${password}": ${list.join(', ')}`)
  }
}
