import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import { Role } from '#enums/role_enum'
import env from '#start/env'
import { formatPhone, normalizePhone } from '#helpers/phone'

const DEMO_PASSWORD = 'password123'

// The one list the seeder creates and the demo banner prints, so they can't disagree.
export function demoAccounts() {
  return [
    {
      label: 'Pemilik (Owner)',
      fullName: 'Budi Santoso',
      phone: normalizePhone(env.get('ADMIN_PHONE') || '081298765432'),
      role: Role.ADMIN,
      isActive: true,
    },
    {
      label: 'Staf 1',
      fullName: 'Siti Rahmawati',
      phone: normalizePhone('081312345678'),
      role: Role.STAFF,
      isActive: true,
    },
    {
      label: 'Staf 2',
      fullName: 'Ahmad Fauzi',
      phone: normalizePhone('081387654321'),
      role: Role.STAFF,
      isActive: true,
    },
    {
      label: 'Pelanggan 1',
      fullName: 'Rina Wulandari',
      phone: normalizePhone('082111223344'),
      role: Role.CUSTOMER,
      isActive: true,
    },
    {
      label: 'Pelanggan 2',
      fullName: 'Dimas Prasetyo',
      phone: normalizePhone('085299887766'),
      role: Role.CUSTOMER,
      isActive: true,
    },
    {
      label: 'Akun Nonaktif',
      fullName: 'Eko Wahyudi',
      phone: normalizePhone('087812345670'),
      role: Role.CUSTOMER,
      isActive: false,
    },
  ]
}

export function demoAccountsBanner() {
  const lines = demoAccounts().map((account) => {
    const signInPage = account.role === Role.CUSTOMER ? '/masuk' : '/staf/masuk'
    const access = account.isActive ? `-> ${signInPage}` : '(dinonaktifkan)'
    return `${account.label.padEnd(16)}: ${formatPhone(account.phone)} / ${DEMO_PASSWORD} ${access}`
  })

  return [
    '',
    '='.repeat(64),
    'Akun Demo Umima Clean:',
    '-'.repeat(64),
    ...lines,
    '='.repeat(64),
  ].join('\n')
}

export default class extends BaseSeeder {
  override async run() {
    if (!env.get('ADMIN_PHONE') && env.get('NODE_ENV') === 'production') {
      throw new Error('Variabel lingkungan ADMIN_PHONE wajib disetel di lingkungan produksi.')
    }

    for (const account of demoAccounts()) {
      await User.updateOrCreate(
        { phone: account.phone },
        {
          fullName: account.fullName,
          password: DEMO_PASSWORD,
          role: account.role,
          isActive: account.isActive,
        }
      )
    }
  }
}
