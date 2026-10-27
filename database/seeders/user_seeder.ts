import logger from '@adonisjs/core/services/logger'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import { Role } from '#enums/role_enum'
import User from '#models/user'

const PASSWORD = 'password'

export const DEMO_PHONE = '6281221847305'

const ACCOUNTS = [
  { role: Role.CUSTOMER, name: 'Rina Kartika', phone: DEMO_PHONE },
  { role: Role.CUSTOMER, name: 'Budi Santoso', phone: '6285720419836' },
  { role: Role.STAFF, name: 'Dedi Supriadi', phone: '6287823561940' },
]

export const DEMO_CUSTOMERS = [
  ['Laras Putri', '6281394027716'],
  ['Fajar Nugraha', '6289652318047'],
  ['Siti Aminah', '6285295104483'],
  ['Dewi Lestari', '6281802736591'],
  ['Hendra Wijaya', '6282118450267'],
  ['Maya Sari', '6287731629054'],
  ['Indra Kusuma', '6281572903318'],
  ['Rudi Hartono', '6285861247790'],
  ['Nadia Putri', '6281214695082'],
  ['Teguh Prasetyo', '6283820571436'],
] as const

export default class extends BaseSeeder {
  override async run() {
    for (const account of ACCOUNTS) {
      const user = await User.findBy('phone', account.phone)
      await (user ?? new User())
        .merge({
          ...account,
          password: PASSWORD,
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
          password: PASSWORD,
          phoneVerifiedAt: DateTime.now(),
        }
      )
    }

    const list = ACCOUNTS.map((account) => `${account.role} ${account.phone} (${account.name})`)
    logger.info(`Demo accounts, password "${PASSWORD}": ${list.join(', ')}`)
  }
}
