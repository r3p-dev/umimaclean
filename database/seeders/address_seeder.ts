import { BaseSeeder } from '@adonisjs/lucid/seeders'
import CustomerAddress from '#models/customer_address'
import User from '#models/user'
import { DEMO_PHONE } from '#database/seeders/user_seeder'

const ADDRESSES = [
  {
    label: 'Rumah',
    addressText: 'Jl. Cisitu Indah III No. 12, RT 03/RW 05, Dago, Coblong, Kota Bandung',
    landmark: 'Pagar hitam, sebelah warung',
    lat: -6.8784,
    lng: 107.6128,
    isPrimary: true,
  },
  {
    label: 'Kantor',
    addressText: 'Jl. Asia Afrika No. 8, Lt. 3, Braga, Sumur Bandung, Kota Bandung',
    landmark: 'Titip di resepsionis lobi',
    lat: -6.9215,
    lng: 107.6094,
    isPrimary: false,
  },
  {
    label: 'Rumah Ibu',
    addressText: 'Jl. Kopo Permai II Blok 3A No. 7, Margahayu, Kab. Bandung',
    landmark: 'Depan masjid',
    recipientName: 'Sri Wahyuni',
    recipientPhone: '6281320574619',
    lat: -6.9663,
    lng: 107.5742,
    isPrimary: false,
  },
]

const DEMO_ADDRESSES = [
  ['6281394027716', 'Jl. Cisitu Indah III No. 20, Dago, Coblong, Kota Bandung', -6.8806, 107.6113],
  ['6289652318047', 'Jl. Sukajadi No. 140, Sukagalih, Sukajadi, Kota Bandung', -6.889, 107.596],
  [
    '6285295104483',
    'Jl. Gegerkalong Hilir No. 41, Sukarasa, Sukasari, Kota Bandung',
    -6.872,
    107.589,
  ],
  [
    '6281802736591',
    'Jl. Tubagus Ismail VIII No. 7, Sekeloa, Coblong, Kota Bandung',
    -6.886,
    107.621,
  ],
  [
    '6282118450267',
    'Jl. Gegerkalong Girang No. 18, Isola, Sukasari, Kota Bandung',
    -6.864,
    107.593,
  ],
  ['6287731629054', 'Jl. Cipaganti No. 102, Pasteur, Sukajadi, Kota Bandung', -6.889, 107.604],
  ['6281572903318', 'Jl. Dipatiukur No. 66, Lebakgede, Coblong, Kota Bandung', -6.8898, 107.6158],
  ['6285861247790', 'Jl. Terusan Jakarta No. 12, Antapani, Kota Bandung', -6.913, 107.66],
  ['6281214695082', 'Jl. Margahayu Raya No. 5, Margahayu, Kab. Bandung', -6.97, 107.58],
  ['6283820571436', 'Jl. Amir Machmud No. 300, Cimahi Tengah, Kota Cimahi', -6.872, 107.542],
] as const

const SECOND_ADDRESS = {
  phone: '6281394027716',
  label: 'Kos Adik',
  recipientName: 'Dimas Putra',
  recipientPhone: '6285624081739',
  addressText: 'Jl. Ciumbuleuit No. 94, Hegarmanah, Cidadap, Kota Bandung',
  landmark: 'Kos pagar hijau, titip ke penjaga',
  lat: -6.8745,
  lng: 107.6041,
}

export default class extends BaseSeeder {
  override async run() {
    const customer = await User.findByOrFail('phone', DEMO_PHONE)
    for (const address of ADDRESSES) {
      await CustomerAddress.updateOrCreate(
        { userId: customer.id, label: address.label },
        {
          recipientName: customer.name,
          recipientPhone: customer.phone,
          ...address,
          userId: customer.id,
        }
      )
    }

    for (const [phone, addressText, lat, lng] of DEMO_ADDRESSES) {
      const user = await User.findByOrFail('phone', phone)
      await CustomerAddress.firstOrCreate(
        { userId: user.id, label: 'Rumah' },
        {
          recipientName: user.name,
          recipientPhone: user.phone,
          addressText,
          landmark: null,
          lat,
          lng,
          isPrimary: true,
        }
      )
    }

    const { phone, label, ...address } = SECOND_ADDRESS
    const user = await User.findByOrFail('phone', phone)
    await CustomerAddress.firstOrCreate(
      { userId: user.id, label },
      { ...address, isPrimary: false }
    )
  }
}
