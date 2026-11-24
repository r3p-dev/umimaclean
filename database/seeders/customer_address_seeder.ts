import { BaseSeeder } from '@adonisjs/lucid/seeders'
import CustomerAddress from '#models/customer_address'
import User from '#models/user'
import { normalizePhone } from '#helpers/phone'

// Demo addresses for the demo customers (user_seeder), only for a customer who has none yet.
// "Kos Adik" lies in Cileunyi, a district the seeded areas leave off, so the address list shows
// "Di luar area layanan" (D82); the seeder writes rows directly, skipping the coverage check. The
// street and kelurahan are what our OSM data names at each pin (null where it names none).
const DEMO_ADDRESSES = [
  {
    phone: '082111223344',
    addresses: [
      {
        label: 'Rumah',
        recipientName: 'Rina Wulandari',
        recipientPhone: '082111223344',
        addressText: 'Jalan Kidang Pananjung No. 35, Dago, Coblong',
        details: 'RT 02/RW 05, pagar hijau depan warung kopi',
        lat: -6.881768,
        lng: 107.61421,
        street: 'Jalan Kidang Pananjung',
        kelurahan: 'Dago',
        kecamatan: 'Coblong',
        city: 'Kota Bandung',
        isPrimary: true,
      },
      {
        label: 'Kantor',
        recipientName: 'Rina Wulandari',
        recipientPhone: '082111223344',
        addressText: 'Jalan Mulya Sari No. 120, Sukagalih, Sukajadi',
        details: 'Lantai 2',
        lat: -6.889265,
        lng: 107.588769,
        street: 'Jalan Mulya Sari',
        kelurahan: 'Sukagalih',
        kecamatan: 'Sukajadi',
        city: 'Kota Bandung',
        isPrimary: false,
      },
      {
        label: 'Kos Adik',
        recipientName: 'Sinta Wulandari',
        recipientPhone: '081398765432',
        addressText: 'Jl. Raya Cileunyi No. 8, Cileunyi Kulon',
        details: null,
        lat: -6.925479,
        lng: 107.742516,
        street: null,
        kelurahan: null,
        kecamatan: 'Cileunyi',
        city: 'Kabupaten Bandung',
        isPrimary: false,
      },
    ],
  },
  {
    phone: '085299887766',
    addresses: [
      {
        label: 'Rumah',
        recipientName: 'Dimas Prasetyo',
        recipientPhone: '085299887766',
        addressText: 'Komplek Bumi Asri Blok C2 No. 7',
        details: 'Rumah cat putih di ujung gang',
        lat: -6.987928,
        lng: 107.663122,
        street: null,
        kelurahan: null,
        kecamatan: 'Bojongsoang',
        city: 'Kabupaten Bandung',
        isPrimary: true,
      },
    ],
  },
]

export default class CustomerAddressSeeder extends BaseSeeder {
  override async run() {
    for (const demo of DEMO_ADDRESSES) {
      const customer = await User.findBy('phone', normalizePhone(demo.phone))
      if (!customer || (await CustomerAddress.findBy('user_id', customer.id))) {
        continue
      }
      await CustomerAddress.createMany(
        demo.addresses.map((address) => ({
          ...address,
          userId: customer.id,
          recipientPhone: normalizePhone(address.recipientPhone),
        }))
      )
    }
  }
}
