export type PriceTab = 'sepatu' | 'tas' | 'warna'

export const PRICE_TABS: { value: PriceTab; label: string }[] = [
  { value: 'sepatu', label: 'Sepatu' },
  { value: 'tas', label: 'Tas & helm' },
  { value: 'warna', label: 'Pewarnaan' },
]

export type PriceEntry = {
  name: string
  price: number
  from?: boolean
  description?: string
  dropOff?: boolean
}

export const SHOE_PRICES: PriceEntry[] = [
  {
    name: 'Premium for Suede',
    price: 120000,
    from: true,
    description:
      'Perawatan khusus sepatu suede agar kembali memiliki dua sisi gelap dan terang serta lembut kembali.',
  },
  {
    name: 'Mild',
    price: 60000,
    description: 'Pencucian bagian luar dan dalam untuk menjaga sepatu tetap bersih.',
  },
  {
    name: 'Medium',
    price: 65000,
    description: 'Pencucian bagian luar dan dalam untuk sepatu dengan noda cenderung ringan.',
  },
  {
    name: 'Hard',
    price: 70000,
    description:
      'Pencucian bagian luar dan dalam untuk sepatu dengan noda berat atau cenderung berat.',
  },
  {
    name: 'Kids Shoes',
    price: 40000,
    from: true,
    description: 'Pencucian bagian luar dan dalam untuk sepatu anak.',
  },
  {
    name: 'Just for Her',
    price: 45000,
    description: 'Untuk flat shoes, heels, wedges, dan flip-flop.',
  },
  {
    name: 'Unyellowing',
    price: 30000,
    from: true,
    description: 'Menghilangkan warna kuning pada sepatu.',
  },
]

export const SHOE_SURCHARGES: { name: string; price: number }[] = [
  { name: 'Sepatu putih / mummy', price: 10000 },
  { name: 'Nubuck, suede', price: 10000 },
  { name: 'One Day Service (selesai 1 hari)', price: 10000 },
]

export const BAG_MATERIALS = ['Kanvas / kain', 'Kulit / nubuck']

export const BAG_PRICES: { size: string; limit: string; prices: number[] }[] = [
  { size: 'Small', limit: '< 25 cm', prices: [40000, 60000] },
  { size: 'Medium', limit: '< 35 cm', prices: [55000, 75000] },
  { size: 'Large', limit: '< 60 cm', prices: [70000, 85000] },
  { size: 'X-Large', limit: '> 60 cm', prices: [85000, 100000] },
]

export const HELMET_PRICES: PriceEntry[] = [
  { name: 'Helmet Spa Reguler', price: 35000, dropOff: true },
  { name: 'Helmet Spa Premium', price: 70000, dropOff: true },
]

export const COLOR_PRICES: PriceEntry[] = [
  {
    name: 'Premium Repaint',
    price: 150000,
    from: true,
    description: 'Pewarnaan sepatu di bagian upper.',
  },
  {
    name: 'Midsole Repaint / Recolour',
    price: 180000,
    description: 'Pewarnaan bagian midsole sepatu.',
  },
]
