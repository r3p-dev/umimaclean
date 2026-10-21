import { randomBytes } from 'node:crypto'
import logger from '@adonisjs/core/services/logger'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import { ItemKind } from '#enums/order_enum'
import { Role } from '#enums/role_enum'
import { ServiceType } from '#enums/service_enum'
import { StaffShift, StaffType } from '#enums/staff_enum'
import CustomerAddress from '#models/customer_address'
import Service from '#models/service'
import ServiceDistrict from '#models/service_district'
import User from '#models/user'
import { DEFAULT_COVERAGE, coverageRows } from '#services/service_area_service'
import SettingsService, { DEFAULT_SETTINGS, type SettingKey } from '#services/settings_service'
import { SERVICE_ZONE } from '#validators/shared/rules/pickup'

export const DEMO_PHONE = '6281223456789'

export const ACCOUNTS = [
  { role: Role.CUSTOMER, name: 'Rina Kartika', phone: DEMO_PHONE },
  { role: Role.CUSTOMER, name: 'Budi Santoso', phone: '6281234500000' },
  { role: Role.ADMIN, name: 'Umi Maryam', phone: '6281122001100' },
  {
    role: Role.STAFF,
    name: 'Dedi Supriadi',
    phone: '6281234567801',
    staffType: StaffType.COURIER_STORE,
    shift: StaffShift.MORNING,
  },
  {
    role: Role.STAFF,
    name: 'Sari Wulandari',
    phone: '6281322334455',
    staffType: StaffType.WORKSHOP,
    shift: StaffShift.MORNING,
  },
]

export const ADDRESSES = [
  {
    label: 'Rumah',
    addressText: 'Jl. Cisitu Indah III No. 12, RT 03/RW 05, Dago, Coblong, Kota Bandung',
    landmark: 'Pagar hitam, sebelah warung',
    lat: -6.8784,
    lng: 107.6128,
    lastUsedAt: '2026-08-14T10:05',
    isPrimary: true,
  },
  {
    label: 'Kantor',
    addressText: 'Jl. Asia Afrika No. 8, Lt. 3, Braga, Sumur Bandung, Kota Bandung',
    landmark: 'Titip di resepsionis lobi',
    lat: -6.9215,
    lng: 107.6094,
    lastUsedAt: '2026-06-02T19:40',
    isPrimary: false,
  },
  {
    label: 'Rumah Ibu',
    addressText: 'Jl. Kopo Permai II Blok 3A No. 7, Margahayu, Kab. Bandung',
    landmark: 'Depan masjid',
    lat: -6.9663,
    lng: 107.5742,
    lastUsedAt: null,
    isPrimary: false,
  },
]

const { SHOE, BAG, HELMET } = ItemKind
const { MAIN, ADDON } = ServiceType

type ServiceSeed = [string, ServiceType, ItemKind[], number, number, string, boolean?]

export const CATALOGUE: ServiceSeed[] = [
  [
    'Mild',
    MAIN,
    [SHOE],
    60000,
    3,
    'Pencucian bagian luar dan dalam untuk menjaga sepatu tetap bersih.',
  ],
  ['Medium', MAIN, [SHOE], 65000, 3, 'Pencucian luar dan dalam untuk noda cenderung ringan.'],
  ['Hard', MAIN, [SHOE], 70000, 4, 'Pencucian luar dan dalam untuk noda berat.'],
  ['Premium for Suede', MAIN, [SHOE], 120000, 5, 'Perawatan khusus sepatu suede.', true],
  ['Kids Shoes', MAIN, [SHOE], 40000, 3, 'Pencucian luar dan dalam untuk sepatu anak.', true],
  ['Just for Her', MAIN, [SHOE], 45000, 3, 'Untuk flat shoes, heels, wedges, dan flip-flop.'],
  ['Premium Repaint', MAIN, [SHOE], 150000, 7, 'Pewarnaan sepatu di bagian upper.', true],
  ['Midsole Repaint / Recolour', MAIN, [SHOE], 180000, 7, 'Pewarnaan bagian midsole sepatu.'],
  ['Unyellowing', ADDON, [SHOE], 30000, 2, 'Menghilangkan warna kuning pada sol.', true],
  ['Sepatu putih / mummy', ADDON, [SHOE], 10000, 0, 'Tambahan untuk sepatu putih.'],
  ['Nubuck / suede', ADDON, [SHOE], 10000, 0, 'Tambahan untuk bahan nubuck dan suede.'],
  ['One Day Service', ADDON, [SHOE], 10000, 0, 'Selesai dalam 1 hari.'],
  ['Tas Small · kanvas', MAIN, [BAG], 40000, 3, 'Tas kanvas atau kain, kurang dari 25 cm.'],
  ['Tas Small · kulit', MAIN, [BAG], 60000, 4, 'Tas kulit atau nubuck, kurang dari 25 cm.'],
  ['Tas Medium · kanvas', MAIN, [BAG], 55000, 3, 'Tas kanvas atau kain, kurang dari 35 cm.'],
  ['Tas Medium · kulit', MAIN, [BAG], 75000, 4, 'Tas kulit atau nubuck, kurang dari 35 cm.'],
  ['Tas Large · kanvas', MAIN, [BAG], 70000, 4, 'Tas kanvas atau kain, kurang dari 60 cm.'],
  ['Tas Large · kulit', MAIN, [BAG], 85000, 5, 'Tas kulit atau nubuck, kurang dari 60 cm.'],
  ['Tas X-Large · kanvas', MAIN, [BAG], 85000, 5, 'Tas kanvas atau kain, lebih dari 60 cm.'],
  ['Tas X-Large · kulit', MAIN, [BAG], 100000, 5, 'Tas kulit atau nubuck, lebih dari 60 cm.'],
  ['Helmet Spa Reguler', MAIN, [HELMET], 35000, 2, 'Busa dalam dilepas, dicuci, dan dikeringkan.'],
  ['Helmet Spa Premium', MAIN, [HELMET], 70000, 3, 'Cuci menyeluruh plus disinfeksi dan pewangi.'],
]

export default class extends BaseSeeder {
  static override environment = ['development']

  override async run() {
    const password = randomBytes(9).toString('base64url')
    const users: User[] = []
    for (const account of ACCOUNTS) {
      const user = await User.findBy('phone', account.phone)
      users.push(
        await (user ?? new User())
          .merge({
            staffType: null,
            shift: null,
            ...account,
            password,
            isActive: true,
            phoneVerifiedAt: user?.phoneVerifiedAt ?? DateTime.now(),
          })
          .save()
      )
    }

    const customer = users[0]
    for (const address of ADDRESSES) {
      await CustomerAddress.updateOrCreate(
        { userId: customer.id, label: address.label },
        {
          ...address,
          userId: customer.id,
          recipientName: customer.name,
          recipientPhone: null,
          deletedAt: null,
          lastUsedAt: address.lastUsedAt
            ? DateTime.fromISO(address.lastUsedAt, { zone: SERVICE_ZONE }).toUTC()
            : null,
        }
      )
    }

    for (const [
      position,
      [name, type, categories, price, days, description, isStarting],
    ] of CATALOGUE.entries()) {
      await Service.updateOrCreate(
        { name },
        {
          name,
          type,
          categories,
          price,
          days,
          description,
          isStartingPrice: isStarting ?? false,
          isActive: true,
          position,
          deletedAt: null,
        }
      )
    }

    const settings = new SettingsService()
    for (const key of Object.keys(DEFAULT_SETTINGS) as SettingKey[]) {
      await settings.put(key, DEFAULT_SETTINGS[key])
    }

    if (!(await ServiceDistrict.query().first())) {
      await ServiceDistrict.createMany(coverageRows(DEFAULT_COVERAGE))
    }

    const list = ACCOUNTS.map((account) => `${account.role} ${account.phone} (${account.name})`)
    logger.info(`Demo accounts, password "${password}": ${list.join(', ')}`)
  }
}
