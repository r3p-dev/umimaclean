import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { ItemKind } from '#enums/item_kind_enum'
import { ServiceType } from '#enums/service_type_enum'
import Service from '#models/service'

export interface ServiceSeedDefinition {
  name: string
  type: ServiceType
  itemKinds: ItemKind[]
  price: number
  estimatedDays: number
  isStartingFrom: boolean
  description: string
}

export const SEEDED_SERVICES: readonly ServiceSeedDefinition[] = [
  {
    name: 'Mild',
    type: ServiceType.MAIN,
    itemKinds: [ItemKind.SHOE],
    price: 60_000,
    estimatedDays: 3,
    isStartingFrom: false,
    description: 'Pencucian bagian luar dan dalam untuk menjaga sepatu tetap bersih.',
  },
  {
    name: 'Medium',
    type: ServiceType.MAIN,
    itemKinds: [ItemKind.SHOE],
    price: 65_000,
    estimatedDays: 3,
    isStartingFrom: false,
    description: 'Pencucian luar dan dalam untuk noda cenderung ringan.',
  },
  {
    name: 'Hard',
    type: ServiceType.MAIN,
    itemKinds: [ItemKind.SHOE],
    price: 70_000,
    estimatedDays: 4,
    isStartingFrom: false,
    description: 'Pencucian luar dan dalam untuk noda berat.',
  },
  {
    name: 'Premium for Suede',
    type: ServiceType.MAIN,
    itemKinds: [ItemKind.SHOE],
    price: 120_000,
    estimatedDays: 5,
    isStartingFrom: true,
    description: 'Perawatan khusus sepatu suede.',
  },
  {
    name: 'Kids Shoes',
    type: ServiceType.MAIN,
    itemKinds: [ItemKind.SHOE],
    price: 40_000,
    estimatedDays: 3,
    isStartingFrom: true,
    description: 'Pencucian luar dan dalam untuk sepatu anak.',
  },
  {
    name: 'Just for Her',
    type: ServiceType.MAIN,
    itemKinds: [ItemKind.SHOE],
    price: 45_000,
    estimatedDays: 3,
    isStartingFrom: false,
    description: 'Untuk flat shoes, heels, wedges, dan flip-flop.',
  },
  {
    name: 'Premium Repaint',
    type: ServiceType.MAIN,
    itemKinds: [ItemKind.SHOE],
    price: 150_000,
    estimatedDays: 7,
    isStartingFrom: true,
    description: 'Pewarnaan sepatu di bagian upper.',
  },
  {
    name: 'Midsole Repaint / Recolour',
    type: ServiceType.MAIN,
    itemKinds: [ItemKind.SHOE],
    price: 180_000,
    estimatedDays: 7,
    isStartingFrom: false,
    description: 'Pewarnaan bagian midsole sepatu.',
  },
  {
    name: 'Unyellowing',
    type: ServiceType.ADDON,
    itemKinds: [ItemKind.SHOE],
    price: 30_000,
    estimatedDays: 2,
    isStartingFrom: true,
    description: 'Menghilangkan warna kuning pada sol.',
  },
  {
    name: 'Sepatu putih / mummy',
    type: ServiceType.ADDON,
    itemKinds: [ItemKind.SHOE],
    price: 10_000,
    estimatedDays: 0,
    isStartingFrom: false,
    description: 'Tambahan untuk sepatu putih.',
  },
  {
    name: 'Nubuck / suede',
    type: ServiceType.ADDON,
    itemKinds: [ItemKind.SHOE],
    price: 10_000,
    estimatedDays: 0,
    isStartingFrom: false,
    description: 'Tambahan untuk bahan nubuck dan suede.',
  },
  {
    name: 'One Day Service',
    type: ServiceType.ADDON,
    itemKinds: [ItemKind.SHOE],
    price: 10_000,
    estimatedDays: 0,
    isStartingFrom: false,
    description: 'Selesai dalam 1 hari.',
  },
  {
    name: 'Tas Small · kanvas',
    type: ServiceType.MAIN,
    itemKinds: [ItemKind.BAG],
    price: 40_000,
    estimatedDays: 3,
    isStartingFrom: false,
    description: 'Tas kanvas atau kain, kurang dari 25 cm.',
  },
  {
    name: 'Tas Small · kulit',
    type: ServiceType.MAIN,
    itemKinds: [ItemKind.BAG],
    price: 60_000,
    estimatedDays: 4,
    isStartingFrom: false,
    description: 'Tas kulit atau nubuck, kurang dari 25 cm.',
  },
  {
    name: 'Tas Medium · kanvas',
    type: ServiceType.MAIN,
    itemKinds: [ItemKind.BAG],
    price: 55_000,
    estimatedDays: 3,
    isStartingFrom: false,
    description: 'Tas kanvas atau kain, kurang dari 35 cm.',
  },
  {
    name: 'Tas Medium · kulit',
    type: ServiceType.MAIN,
    itemKinds: [ItemKind.BAG],
    price: 75_000,
    estimatedDays: 4,
    isStartingFrom: false,
    description: 'Tas kulit atau nubuck, kurang dari 35 cm.',
  },
  {
    name: 'Tas Large · kanvas',
    type: ServiceType.MAIN,
    itemKinds: [ItemKind.BAG],
    price: 70_000,
    estimatedDays: 4,
    isStartingFrom: false,
    description: 'Tas kanvas atau kain, kurang dari 60 cm.',
  },
  {
    name: 'Tas Large · kulit',
    type: ServiceType.MAIN,
    itemKinds: [ItemKind.BAG],
    price: 85_000,
    estimatedDays: 5,
    isStartingFrom: false,
    description: 'Tas kulit atau nubuck, kurang dari 60 cm.',
  },
  {
    name: 'Tas X-Large · kanvas',
    type: ServiceType.MAIN,
    itemKinds: [ItemKind.BAG],
    price: 85_000,
    estimatedDays: 5,
    isStartingFrom: false,
    description: 'Tas kanvas atau kain, lebih dari 60 cm.',
  },
  {
    name: 'Tas X-Large · kulit',
    type: ServiceType.MAIN,
    itemKinds: [ItemKind.BAG],
    price: 100_000,
    estimatedDays: 5,
    isStartingFrom: false,
    description: 'Tas kulit atau nubuck, lebih dari 60 cm.',
  },
  {
    name: 'Helmet Spa Reguler',
    type: ServiceType.MAIN,
    itemKinds: [ItemKind.HELMET],
    price: 35_000,
    estimatedDays: 2,
    isStartingFrom: false,
    description: 'Busa dalam dilepas, dicuci, dan dikeringkan. Khusus bawa langsung ke toko.',
  },
  {
    name: 'Helmet Spa Premium',
    type: ServiceType.MAIN,
    itemKinds: [ItemKind.HELMET],
    price: 70_000,
    estimatedDays: 3,
    isStartingFrom: false,
    description: 'Cuci menyeluruh plus disinfeksi dan pewangi. Khusus bawa langsung ke toko.',
  },
]

export default class extends BaseSeeder {
  override async run() {
    for (const [displayOrder, definition] of SEEDED_SERVICES.entries()) {
      await Service.updateOrCreate(
        { name: definition.name },
        {
          name: definition.name,
          type: definition.type,
          itemKinds: definition.itemKinds,
          price: definition.price,
          estimatedDays: definition.estimatedDays,
          isStartingFrom: definition.isStartingFrom,
          description: definition.description,
          isActive: true,
          displayOrder,
          deletedAt: null,
        }
      )
    }
  }
}
