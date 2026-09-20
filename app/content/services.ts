/**
 * The four services, their real prices, and the copy that describes them.
 *
 * Prices come from the previous build's catalogue and are the owner's actual
 * price list. Turnaround comes from the owner's published FAQ: 2–4 working
 * days, with a same-day option as a paid add-on. Nothing here is estimated.
 *
 * Each service is a page of its own — not a section on a shared page — because
 * "cuci helm bandung" and "reparasi sepatu bandung" are different searches by
 * different people, and a page can only rank for what it is about.
 */

export type PriceKind = 'regular' | 'startFrom' | 'additional'

export type PriceItem = {
  name: string
  description: string
  /** Rupiah, as an integer. Formatting is a rendering concern. */
  price: number
  kind: PriceKind
}

export type ProcessStep = {
  title: string
  detail: string
}

export type Service = {
  slug: string
  path: string
  /** Full name, used in headings and schema. */
  name: string
  /** schema.org Service.serviceType */
  serviceType: string
  /** The page's <h1>. */
  headline: string
  /** Raw <title>, before the ' · Umima.clean' suffix. */
  title: string
  /** The search snippet. */
  description: string
  /** First paragraph on the page. */
  intro: string
  turnaround: string
  items: readonly PriceItem[]
  process: readonly ProcessStep[]
  /** What we can and cannot take, in the customer's words. */
  materials: readonly string[]
}

export const SERVICES: readonly Service[] = [
  {
    slug: 'cuci-sepatu',
    path: '/layanan/cuci-sepatu',
    name: 'Cuci sepatu',
    serviceType: 'Cuci sepatu',
    headline: 'Cuci Sepatu di Bandung, Antar Jemput Gratis',
    title: 'Cuci Sepatu Bandung, Antar Jemput Gratis',
    description:
      'Cuci sepatu di Bandung mulai Rp60.000. Sneakers, kulit, suede, kanvas, hingga boots. Antar jemput GRATIS se-Bandung, selesai 2-4 hari kerja.',
    intro:
      'Setiap pasang sepatu diperiksa dulu sebelum dicuci. Tingkat kekotoran dan jenis bahan menentukan treatment yang dipakai, karena sabun dan sikat untuk kanvas akan merusak suede. Anda tidak perlu keluar rumah: tim kami menjemput dan mengantar kembali tanpa biaya tambahan di seluruh Bandung.',
    turnaround: '2-4 hari kerja. Tersedia One Day Service untuk yang buru-buru.',
    items: [
      {
        name: 'Mild',
        description: 'Pencucian bagian luar dan dalam untuk menjaga sepatu tetap bersih.',
        price: 60000,
        kind: 'regular',
      },
      {
        name: 'Medium',
        description:
          'Pencucian bagian luar dan dalam pada sepatu yang terdapat noda cenderung ringan.',
        price: 65000,
        kind: 'regular',
      },
      {
        name: 'Hard',
        description:
          'Pencucian bagian luar dan dalam pada sepatu yang terdapat noda berat atau cenderung berat.',
        price: 70000,
        kind: 'regular',
      },
      {
        name: 'Premium For Suede',
        description:
          'Perawatan khusus untuk sepatu suede agar kembali memiliki dua side gelap dan terang serta lembut kembali.',
        price: 120000,
        kind: 'startFrom',
      },
      {
        name: 'Just For Her',
        description:
          'Pencucian bagian luar dan dalam untuk sepatu wanita — flat shoes, heels, wedges, dan flip flops.',
        price: 45000,
        kind: 'startFrom',
      },
      {
        name: 'Kids Shoes',
        description: 'Pencucian bagian luar dan dalam untuk menjaga sepatu anak tetap bersih.',
        price: 40000,
        kind: 'startFrom',
      },
      {
        name: 'Unyellowing',
        description: 'Pencucian untuk menghilangkan warna kuning pada sol dan midsole.',
        price: 30000,
        kind: 'startFrom',
      },
      {
        name: 'White Shoes / Mummy',
        description: 'Tambahan jasa perawatan khusus sepatu putih.',
        price: 10000,
        kind: 'additional',
      },
      {
        name: 'Nubuck Suede',
        description: 'Perawatan khusus sepatu nubuck suede.',
        price: 10000,
        kind: 'additional',
      },
      {
        name: 'One Day Service',
        description: 'Pencucian sepatu selesai dalam satu hari.',
        price: 10000,
        kind: 'additional',
      },
    ],
    process: [
      {
        title: 'Inspeksi',
        detail:
          'Sepatu diperiksa satu per satu: jenis bahan, tingkat kekotoran, jahitan atau sol yang sudah lepas. Hasilnya menentukan treatment dan harga akhir.',
      },
      {
        title: 'Deep cleaning',
        detail:
          'Upper, midsole, outsole, dan bagian dalam dicuci terpisah dengan sabun dan sikat yang sesuai bahannya.',
      },
      {
        title: 'Unyellowing bila perlu',
        detail:
          'Midsole yang sudah menguning dikembalikan warnanya. Ini treatment terpisah, jadi hanya dikerjakan kalau memang dibutuhkan.',
      },
      {
        title: 'Pengeringan terkontrol',
        detail:
          'Dikeringkan tanpa panas berlebih supaya lem tidak lepas dan bahan tidak berubah bentuk.',
      },
      {
        title: 'Finishing & protection',
        detail:
          'Disikat halus, dirapikan, dan bisa ditambah lapisan pelindung supaya lebih tahan air dan noda.',
      },
    ],
    materials: [
      'Sneakers kanvas dan mesh',
      'Kulit dan sintetis',
      'Suede dan nubuck',
      'Boots',
      'Sepatu anak',
      'Flat shoes, heels, wedges',
    ],
  },

  {
    slug: 'cuci-tas',
    path: '/layanan/cuci-tas',
    name: 'Cuci tas',
    serviceType: 'Cuci tas',
    headline: 'Cuci Tas di Bandung, Antar Jemput Gratis',
    title: 'Cuci Tas Bandung, Antar Jemput Gratis',
    description:
      'Cuci tas di Bandung mulai Rp40.000. Kanvas, fabric, kulit, dan nubuck, dari ukuran kecil sampai extra large. Antar jemput GRATIS se-Bandung.',
    intro:
      'Harga cuci tas mengikuti dua hal: ukuran dan bahan. Tas kanvas dan tas kulit tidak bisa diperlakukan sama — yang satu tahan digosok, yang satu justru rusak kalau kena air berlebih. Kami tentukan treatment-nya setelah tas diperiksa, dan antar jemputnya gratis.',
    turnaround: '2–4 hari kerja, tergantung bahan dan tingkat kekotoran.',
    items: [
      {
        name: 'Small Canvas / Fabric',
        description: 'Cuci tas kecil berbahan canvas atau fabric.',
        price: 40000,
        kind: 'regular',
      },
      {
        name: 'Medium Canvas / Fabric',
        description: 'Cuci tas sedang berbahan canvas atau fabric.',
        price: 55000,
        kind: 'regular',
      },
      {
        name: 'Large Canvas / Fabric',
        description: 'Cuci tas besar berbahan canvas atau fabric.',
        price: 70000,
        kind: 'regular',
      },
      {
        name: 'Extra Large Canvas / Fabric',
        description: 'Cuci tas extra besar berbahan canvas atau fabric.',
        price: 85000,
        kind: 'regular',
      },
      {
        name: 'Small Leather / Nubuck',
        description: 'Cuci tas kecil berbahan leather atau nubuck.',
        price: 60000,
        kind: 'regular',
      },
      {
        name: 'Medium Leather / Nubuck',
        description: 'Cuci tas sedang berbahan leather atau nubuck.',
        price: 75000,
        kind: 'regular',
      },
      {
        name: 'Large Leather / Nubuck',
        description: 'Cuci tas besar berbahan leather atau nubuck.',
        price: 85000,
        kind: 'regular',
      },
      {
        name: 'Extra Large Leather / Nubuck',
        description: 'Cuci tas extra besar berbahan leather atau nubuck.',
        price: 100000,
        kind: 'regular',
      },
    ],
    process: [
      {
        title: 'Inspeksi bahan dan ukuran',
        detail:
          'Bahan menentukan metode, ukuran menentukan harga. Keduanya dicek dulu sebelum tas masuk antrean.',
      },
      {
        title: 'Pembersihan menyeluruh',
        detail:
          'Bagian luar, dalam, tali, dan sudut-sudut yang biasanya terlewat dibersihkan terpisah.',
      },
      {
        title: 'Perawatan bahan kulit',
        detail:
          'Tas kulit dan nubuck tidak direndam. Dibersihkan dengan cairan khusus lalu dikondisikan supaya tidak kering dan retak.',
      },
      {
        title: 'Pengeringan dan pembentukan',
        detail: 'Dikeringkan sambil dijaga bentuknya supaya tas tidak penyok atau berubah bentuk.',
      },
    ],
    materials: [
      'Canvas dan fabric',
      'Kulit asli dan sintetis',
      'Nubuck',
      'Tas ransel, tote, sling, hingga koper kecil',
    ],
  },

  {
    slug: 'cuci-helm',
    path: '/layanan/cuci-helm',
    name: 'Cuci helm',
    serviceType: 'Cuci helm',
    headline: 'Cuci Helm di Bandung, Antar Jemput Gratis',
    title: 'Cuci Helm Bandung, Antar Jemput Gratis',
    description:
      'Cuci helm di Bandung mulai Rp35.000. Busa dalam dilepas, dicuci, dan didisinfeksi sampai bau hilang. Antar jemput GRATIS se-Bandung.',
    intro:
      'Bau helm datang dari busa bagian dalam yang menyerap keringat setiap hari, bukan dari cangkangnya. Karena itu busa dilepas dan dicuci terpisah, lalu didisinfeksi. Cangkang dan visor dibersihkan sendiri supaya tidak baret.',
    turnaround: '2-3 hari kerja, karena busa harus benar-benar kering sebelum dipasang kembali.',
    items: [
      {
        name: 'Helmet SPA Reguler',
        description: 'Cuci helm menyeluruh: busa dalam, cangkang, dan visor.',
        price: 35000,
        kind: 'regular',
      },
      {
        name: 'Helmet SPA Premium',
        description: 'Cuci helm menyeluruh dengan perawatan dan disinfeksi lebih dalam.',
        price: 70000,
        kind: 'regular',
      },
    ],
    process: [
      {
        title: 'Bongkar busa dalam',
        detail:
          'Busa pipi dan busa kepala dilepas. Bagian inilah yang menyimpan keringat dan menyebabkan bau.',
      },
      {
        title: 'Cuci dan disinfeksi',
        detail:
          'Busa dicuci terpisah lalu didisinfeksi supaya bakteri dan bau hilang, bukan tertutup parfum.',
      },
      {
        title: 'Bersihkan cangkang dan visor',
        detail:
          'Cangkang dan visor dibersihkan dengan bahan yang tidak menggores dan tidak membuat visor buram.',
      },
      {
        title: 'Keringkan dan pasang kembali',
        detail:
          'Busa dikeringkan sampai tuntas sebelum dipasang lagi, supaya tidak lembap dan bau kembali.',
      },
    ],
    materials: [
      'Helm half face',
      'Helm full face',
      'Helm modular',
      'Helm dengan busa yang bisa dilepas',
    ],
  },

  {
    slug: 'reparasi-sepatu',
    path: '/layanan/reparasi-sepatu',
    name: 'Reparasi sepatu',
    serviceType: 'Reparasi sepatu',
    headline: 'Reparasi Sepatu di Bandung — Repaint, Reglue, Jahit',
    title: 'Reparasi Sepatu Bandung, Antar Jemput Gratis',
    description:
      'Reparasi sepatu di Bandung: repaint upper mulai Rp150.000, recolour midsole Rp180.000, serta reglue dan jahit. Antar jemput GRATIS se-Bandung.',
    intro:
      'Tidak semua sepatu perlu diganti. Sol yang lepas bisa direkatkan ulang, jahitan yang putus bisa dijahit lagi, dan warna yang pudar bisa dikembalikan. Kalau memang sudah tidak layak diperbaiki, kami bilang apa adanya sebelum Anda membayar apa pun.',
    turnaround:
      'Repaint 3-5 hari kerja. Reglue dan jahit tergantung tingkat kerusakan, dikonfirmasi setelah inspeksi.',
    items: [
      {
        name: 'Premium Repaint',
        description: 'Pewarnaan ulang pada bagian upper sepatu.',
        price: 150000,
        kind: 'startFrom',
      },
      {
        name: 'Midsole Repaint / Recolour',
        description: 'Pewarnaan ulang pada bagian midsole sepatu.',
        price: 180000,
        kind: 'regular',
      },
    ],
    process: [
      {
        title: 'Inspeksi dan penilaian',
        detail:
          'Kerusakan diperiksa dulu: sol lepas, jahitan putus, upper sobek, atau warna pudar. Dari situ kami tentukan apakah sepatu masih layak diperbaiki.',
      },
      {
        title: 'Penawaran harga sebelum dikerjakan',
        detail:
          'Reglue, jahit, dan penggantian bagian dihitung setelah inspeksi karena tingkat kerusakannya berbeda-beda. Harga dikonfirmasi ke Anda sebelum pengerjaan dimulai.',
      },
      {
        title: 'Pengerjaan oleh pengrajin',
        detail:
          'Jahitan, sol, dan bagian yang rusak dikerjakan dengan presisi, bukan sekadar ditambal.',
      },
      {
        title: 'Repaint dan finishing',
        detail:
          'Kalau warna ikut diperbaiki, pewarnaan dilakukan bertahap supaya hasilnya rata dan tidak retak saat sepatu ditekuk.',
      },
    ],
    materials: [
      'Sol lepas (reglue)',
      'Jahitan putus',
      'Upper pudar atau belang (repaint)',
      'Midsole menguning atau pudar (recolour)',
    ],
  },
]

/** Look a service up by slug. Returns undefined for an unknown slug. */
export function findService(slug: string) {
  return SERVICES.find((service) => service.slug === slug)
}

/** Rupiah, formatted the way Indonesian readers expect: Rp60.000 */
export function rupiah(amount: number) {
  return `Rp${amount.toLocaleString('id-ID')}`
}

/** The cheapest standalone (non add-on) price in a service, for "mulai dari" copy. */
export function priceFrom(service: Service) {
  const standalone = service.items.filter((item) => item.kind !== 'additional')

  return Math.min(...standalone.map((item) => item.price))
}
