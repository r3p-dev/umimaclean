/**
 * The free-pickup coverage area — the single source of truth.
 *
 * This is a business decision made by the owner, not something derived from
 * geometry. `areaServed` in the JSON-LD, the area pages, the coverage map, and
 * Phase 5 order eligibility all read from here, so the four cannot drift apart.
 *
 * A previous version of this file guessed at the list and was wrong four ways
 * at once. Nothing may re-derive it. In particular, do not derive it from
 * `../umimaclean-route/database/data/operational_areas.geojson`: that polygon
 * was drawn by hand for a stakeholder pitch and overshoots this list by at
 * least eight kecamatan (Cimenyan, Cileunyi, Arjasari, Ciparay, Rancaekek,
 * Ngamprah, Batujajar, Padalarang). Used for eligibility it would auto-approve
 * orders a human then has to refuse — the most expensive failure available,
 * because the customer has already been promised.
 *
 * NOTE ON THE COUNT: the specification describes this as 44 kecamatan with 11
 * in Kabupaten Bandung, but names only 10 there, giving 43. Every count shown
 * to a visitor is computed from these arrays rather than hardcoded, so when the
 * eleventh name arrives the copy corrects itself. Until then nothing claims a
 * number the list cannot back up.
 */

/** All 30 kecamatan of Kota Bandung. */
export const KOTA_BANDUNG = [
  'Andir',
  'Antapani',
  'Arcamanik',
  'Astanaanyar',
  'Babakan Ciparay',
  'Bandung Kidul',
  'Bandung Kulon',
  'Bandung Wetan',
  'Batununggal',
  'Bojongloa Kaler',
  'Bojongloa Kidul',
  'Buahbatu',
  'Cibeunying Kaler',
  'Cibeunying Kidul',
  'Cibiru',
  'Cicendo',
  'Cidadap',
  'Cinambo',
  'Coblong',
  'Gedebage',
  'Kiaracondong',
  'Lengkong',
  'Mandalajati',
  'Panyileukan',
  'Rancasari',
  'Regol',
  'Sukajadi',
  'Sukasari',
  'Sumur Bandung',
  'Ujungberung',
] as const

/** All 3 kecamatan of Kota Cimahi. */
export const KOTA_CIMAHI = ['Cimahi Selatan', 'Cimahi Tengah', 'Cimahi Utara'] as const

/** The Kabupaten Bandung kecamatan that are served. */
export const KABUPATEN_BANDUNG = [
  'Baleendah',
  'Banjaran',
  'Bojongsoang',
  'Cangkuang',
  'Dayeuhkolot',
  'Katapang',
  'Margaasih',
  'Margahayu',
  'Pameungpeuk',
  'Soreang',
] as const

/** Every covered kecamatan, flat. */
export const COVERED_KECAMATAN: readonly string[] = [
  ...KOTA_BANDUNG,
  ...KOTA_CIMAHI,
  ...KABUPATEN_BANDUNG,
]

/**
 * Neighbours people plausibly ask about but that we do not serve.
 *
 * Saying so plainly captures the "apakah X masuk area" query, saves the
 * customer a message, and reads as honest. Cimahi must never appear here — it
 * is covered, and a stale "belum terjangkau" entry would turn a real customer
 * away.
 */
export const NOT_COVERED_KECAMATAN = [
  /**
   * Cilengkrang was served and no longer is. It has to appear here, not just
   * be missing from the covered list, or the page silently stops answering a
   * question it used to answer.
   */
  'Cilengkrang',
  'Padalarang',
  'Ngamprah',
  'Batujajar',
  'Lembang',
  'Cimenyan',
  'Cileunyi',
  'Rancaekek',
  'Ciparay',
  'Arjasari',
] as const

/**
 * Uncovered neighbours drawn individually on the map, so hovering answers
 * "is Padalarang covered?" without reading the list.
 *
 * Deliberately a subset of NOT_COVERED_KECAMATAN. Every uncovered neighbour
 * appears in the text list — that is the half that ranks — but each one drawn
 * separately costs geometry, and the map has a byte budget. The ones left out
 * sit far enough from the coverage frame that nobody hovers there expecting an
 * answer.
 */
export const MAP_NEIGHBOURS = [
  'Cilengkrang',
  'Cimenyan',
  'Cileunyi',
  'Rancaekek',
  'Padalarang',
  'Ngamprah',
  'Batujajar',
  'Lembang',
] as const

/**
 * Area pages are structured by how people search, not by administrative
 * hierarchy. Forty-three pages, one per kecamatan, is the doorway pattern at
 * scale — and nobody types "cuci sepatu kecamatan Pameungpeuk".
 *
 * Tier 1 is a regional hub. Tier 2 is a place name people genuinely type,
 * which is not always a kecamatan: Dago sits inside Coblong, and Kopo straddles
 * Bojongloa Kidul and Margahayu. The slug follows the name people type; the
 * copy names the kecamatan for precision.
 */
export type AreaTier = 'hub' | 'place' | 'campus'

export type Area = {
  slug: string
  tier: AreaTier
  /** The name people search for. */
  name: string
  /** Page <h1>. */
  headline: string
  /** Raw <title>, before the brand suffix. */
  title: string
  description: string
  /** Opening paragraph — must be genuinely specific to this place. */
  intro: string
  /** Kecamatan this page speaks for, from COVERED_KECAMATAN. */
  kecamatan: readonly string[]
  /** Landmarks and neighbourhoods a local would recognise. */
  landmarks: readonly string[]
  /** Campuses served from this page, rendered as their own headings. */
  campuses?: readonly { name: string; kecamatan: string; detail: string }[]
  /** Typical pickup timing, in the owner's terms. */
  pickupNote: string
}

export const AREAS: readonly Area[] = [
  /** ---- Tier 1: regional hubs ---- */
  {
    slug: 'kota-bandung',
    tier: 'hub',
    name: 'Kota Bandung',
    headline: 'Cuci Sepatu Kota Bandung — Antar Jemput Gratis ke 30 Kecamatan',
    title: 'Cuci Sepatu Kota Bandung, Antar Jemput Gratis',
    description:
      'Antar jemput gratis ke seluruh 30 kecamatan di Kota Bandung, dari Sukasari sampai Gedebage. Cuci sepatu, tas, helm, dan reparasi sepatu.',
    intro:
      'Seluruh Kota Bandung masuk area antar jemput kami — ketiga puluh kecamatannya, bukan sebagian. Anda tidak perlu mengantar sendiri ke Margacinta: tim kami menjemput ke rumah, kos, atau kantor, lalu mengantar kembali setelah selesai. Tidak ada ongkos jemput, berapa pun jumlah barangnya.',
    kecamatan: KOTA_BANDUNG,
    landmarks: [
      'Alun-alun dan Jalan Asia Afrika',
      'Dago dan Cihampelas',
      'Buahbatu dan Margacinta',
      'Antapani dan Arcamanik',
      'Ujungberung dan Cibiru',
      'Gedebage dan Summarecon',
    ],
    campuses: [
      {
        name: 'ITB dan Unpad Dipatiukur',
        kecamatan: 'Coblong',
        detail:
          'Kawasan Dago dan Dipatiukur padat kos-kosan. Penjemputan di gang sempit tidak masalah selama titik lokasinya jelas.',
      },
      {
        name: 'UPI',
        kecamatan: 'Sukasari',
        detail: 'Sekitar Setiabudi dan Gegerkalong, termasuk kos di belakang kampus.',
      },
    ],
    pickupNote:
      'Waktu penjemputan menyesuaikan rute hari itu. Kawasan tengah kota biasanya kebagian rute pagi sampai siang.',
  },
  {
    slug: 'kota-cimahi',
    tier: 'hub',
    name: 'Kota Cimahi',
    headline: 'Cuci Sepatu Cimahi — Antar Jemput Gratis',
    title: 'Cuci Sepatu Cimahi, Antar Jemput Gratis',
    description:
      'Cimahi Utara, Tengah, dan Selatan semuanya masuk area antar jemput gratis. Cuci sepatu, tas, helm, dan reparasi sepatu di Cimahi.',
    intro:
      'Cimahi sering dikira di luar jangkauan layanan yang berbasis di Bandung. Ketiga kecamatannya masuk area kami: Cimahi Utara, Cimahi Tengah, dan Cimahi Selatan. Penjemputan dan pengantaran tetap gratis, sama seperti di dalam Kota Bandung.',
    kecamatan: KOTA_CIMAHI,
    landmarks: [
      'Alun-alun Cimahi',
      'Cimahi Mall dan Jalan Amir Machmud',
      'Kawasan Baros',
      'Cibabat dan Cipageran',
    ],
    campuses: [
      {
        name: 'Unjani',
        kecamatan: 'Cimahi Tengah',
        detail:
          'Universitas Jenderal Achmad Yani beserta kos-kosan di sekitarnya masuk rute reguler kami.',
      },
    ],
    pickupNote:
      'Cimahi biasanya masuk rute yang sama dengan Bandung barat, jadi konfirmasi jam penjemputan datang sehari sebelumnya atau pagi hari.',
  },
  {
    slug: 'bandung-selatan',
    tier: 'hub',
    name: 'Bandung Selatan',
    headline: 'Cuci Sepatu Bandung Selatan — Dayeuhkolot sampai Soreang',
    title: 'Cuci Sepatu Bandung Selatan, Antar Jemput Gratis',
    description:
      'Antar jemput gratis di koridor Bandung selatan: Dayeuhkolot, Bojongsoang, Baleendah, Banjaran, Soreang, Katapang, Cangkuang, Pameungpeuk, Margaasih, dan Margahayu.',
    intro:
      'Koridor selatan adalah area dengan volume penjemputan tertinggi kami, sebagian besar karena kawasan kampus dan perumahan di Bojongsoang dan Dayeuhkolot. Kecamatan-kecamatan di Kabupaten Bandung berikut masuk area antar jemput gratis, dan jaraknya dari basecamp kami di Margacinta memang dekat.',
    kecamatan: KABUPATEN_BANDUNG,
    landmarks: [
      'Kawasan Telkom University dan Sukapura',
      'Dayeuhkolot dan Citeureup',
      'Baleendah dan Bojongsoang',
      'Soreang dan Katapang',
      'Margahayu dan Kopo Permai',
    ],
    campuses: [
      {
        name: 'Telkom University',
        kecamatan: 'Bojongsoang',
        detail:
          'Konsentrasi kos-kosan terpadat di area layanan kami. Punya halaman sendiri — lihat area Telkom University.',
      },
    ],
    pickupNote:
      'Koridor selatan biasanya kebagian rute siang sampai sore, dan sering bisa dijemput di hari yang sama kalau pesan pagi.',
  },

  /** ---- Campus: the single highest-value page in the coverage area ---- */
  {
    slug: 'telkom-university',
    tier: 'campus',
    name: 'Telkom University',
    headline: 'Cuci Sepatu Telkom University — Jemput ke Kos, Gratis',
    title: 'Cuci Sepatu Telkom University, Jemput ke Kos',
    description:
      'Cuci sepatu untuk mahasiswa Telkom University. Dijemput langsung dari kos di Sukapura, Bojongsoang, dan sekitarnya. Gratis, tanpa ongkos jemput.',
    intro:
      'Kalau Anda kuliah di Telkom University dan tidak punya kendaraan, mengantar sepatu ke tempat cuci itu ongkos dan waktu. Kami jemput ke depan kos Anda — Sukapura, Sukabirus, Batununggal Indah, atau perumahan di sekitar kampus — lalu antar balik setelah selesai. Tidak ada ongkos jemput, dan Anda tidak perlu keluar kos sama sekali.',
    kecamatan: ['Bojongsoang'],
    landmarks: [
      'Gerbang utama Telkom University',
      'Kos-kosan Sukapura dan Sukabirus',
      'Kawasan Batununggal dan Buahbatu',
      'Dayeuhkolot dan Citeureup',
    ],
    pickupNote:
      'Titipkan ke penjaga kos kalau Anda sedang kuliah — konfirmasi saja ke tim yang menghubungi. Menjelang UTS dan UAS antrean lebih panjang, jadi pesan lebih awal kalau butuh cepat.',
  },

  /** ---- Tier 2: place names people actually type ---- */
  {
    slug: 'buahbatu',
    tier: 'place',
    name: 'Buahbatu',
    headline: 'Cuci Sepatu Buahbatu — Antar Jemput Gratis',
    title: 'Cuci Sepatu Buahbatu, Antar Jemput Gratis',
    description:
      'Basecamp kami ada di Margacinta, Buahbatu. Cuci sepatu, tas, dan helm dengan antar jemput gratis di seluruh kawasan Buahbatu dan sekitarnya.',
    intro:
      'Buahbatu adalah kandang kami: basecamp UmimaClean ada di Jl. Margacinta No.132. Kalau Anda tinggal di sekitar sini, Anda bisa mampir langsung, atau tetap pakai antar jemput gratis seperti pelanggan lain — banyak yang memilih dijemput walaupun jaraknya dekat.',
    kecamatan: ['Buahbatu'],
    landmarks: [
      'Jalan Margacinta dan Ciwastra',
      'Kawasan Batununggal Indah',
      'Metro Indah Mall',
      'Jalan Soekarno-Hatta sisi timur',
    ],
    pickupNote:
      'Karena ini area basecamp, penjemputan di Buahbatu paling fleksibel dan sering bisa di hari yang sama.',
  },
  {
    slug: 'dago',
    tier: 'place',
    name: 'Dago',
    headline: 'Cuci Sepatu Dago — Jemput ke Kos dan Kampus, Gratis',
    title: 'Cuci Sepatu Dago, Antar Jemput Gratis',
    description:
      'Cuci sepatu di kawasan Dago, Coblong, dan Dipatiukur. Dijemput langsung dari kos atau kantor, gratis, termasuk sekitar ITB dan Unpad.',
    intro:
      'Dago secara administratif masuk Kecamatan Coblong, dan kawasan ini padat kos mahasiswa serta kantor. Gang-gang di sekitar Dago dan Dipatiukur sempit, tapi itu bukan masalah untuk tim kami selama titik lokasinya jelas — justru di situ antar jemput gratis paling terasa gunanya.',
    kecamatan: ['Coblong'],
    landmarks: [
      'Jalan Ir. H. Juanda (Dago)',
      'Dipatiukur dan Simpang Dago',
      'Sekeloa dan Cisitu',
      'Taman Sari',
    ],
    campuses: [
      {
        name: 'ITB',
        kecamatan: 'Coblong',
        detail:
          'Kos di Cisitu, Sekeloa, dan Taman Sari semuanya masuk rute reguler. Jemput bisa ke depan gang.',
      },
      {
        name: 'Unpad Dipatiukur',
        kecamatan: 'Coblong',
        detail: 'Kampus Dipatiukur dan kos di sekitarnya, termasuk arah Sekeloa.',
      },
      {
        name: 'Unikom dan Unpas',
        kecamatan: 'Coblong dan Sukajadi',
        detail: 'Kawasan Dipatiukur dan Setiabudi, keduanya masuk area antar jemput gratis.',
      },
    ],
    pickupNote:
      'Kawasan Dago padat, jadi sebutkan patokan yang jelas — nama gang, warung, atau nomor kos.',
  },
  {
    slug: 'antapani',
    tier: 'place',
    name: 'Antapani',
    headline: 'Cuci Sepatu Antapani — Antar Jemput Gratis',
    title: 'Cuci Sepatu Antapani, Antar Jemput Gratis',
    description:
      'Cuci sepatu, tas, dan helm di Antapani dan Arcamanik. Antar jemput gratis ke rumah, termasuk sekitar kampus Itenas.',
    intro:
      'Antapani dan Arcamanik didominasi perumahan, dan sebagian besar pelanggan kami di sini mengirim beberapa pasang sekaligus — sepatu sekolah anak, sepatu kerja, dan sepatu lari dalam satu kali jemput. Karena antar jemput tidak ditagih, menitipkan banyak pasang sekaligus tidak menambah biaya apa pun.',
    kecamatan: ['Antapani', 'Arcamanik'],
    landmarks: [
      'Jalan Terusan Jakarta',
      'Perumahan Antapani',
      'Arcamanik dan Sindanglaya',
      'Stadion Arcamanik',
    ],
    campuses: [
      {
        name: 'Itenas',
        kecamatan: 'Arcamanik',
        detail:
          'Institut Teknologi Nasional beserta kos di sekitar PHH Mustofa dan Arcamanik masuk area jemput.',
      },
    ],
    pickupNote: 'Antapani dan Arcamanik biasanya satu rute, umumnya siang hari.',
  },
  {
    slug: 'cibiru',
    tier: 'place',
    name: 'Cibiru',
    headline: 'Cuci Sepatu Cibiru — Jemput ke Kos UIN, Gratis',
    title: 'Cuci Sepatu Cibiru, Antar Jemput Gratis',
    description:
      'Cuci sepatu di Cibiru dan Bandung timur, termasuk kos-kosan sekitar UIN Sunan Gunung Djati. Antar jemput gratis.',
    intro:
      'Cibiru ada di ujung timur Kota Bandung, dan sering dianggap terlalu jauh oleh layanan lain. Kecamatan ini masuk area antar jemput gratis kami, termasuk kawasan kos di sekitar UIN Sunan Gunung Djati yang jadi konsentrasi mahasiswa terbesar di sisi timur.',
    kecamatan: ['Cibiru', 'Panyileukan', 'Cinambo'],
    landmarks: [
      'Kampus UIN Sunan Gunung Djati',
      'Jalan Raya Cibiru dan Cipadung',
      'Panyileukan',
      'Terminal Cibiru',
    ],
    campuses: [
      {
        name: 'UIN Sunan Gunung Djati',
        kecamatan: 'Cibiru',
        detail:
          'Kos-kosan Cipadung dan sekitar kampus masuk rute reguler. Bisa dititipkan ke penjaga kos kalau sedang ada kelas.',
      },
    ],
    pickupNote:
      'Bandung timur biasanya kebagian rute sore. Kalau butuh pagi, sebutkan saat memesan supaya bisa diatur.',
  },
  {
    slug: 'ujungberung',
    tier: 'place',
    name: 'Ujungberung',
    headline: 'Cuci Sepatu Ujungberung — Antar Jemput Gratis',
    title: 'Cuci Sepatu Ujungberung, Antar Jemput Gratis',
    description:
      'Cuci sepatu, tas, dan helm di Ujungberung, Mandalajati, dan Gedebage. Antar jemput gratis ke rumah.',
    intro:
      'Ujungberung dan sekitarnya masuk area antar jemput gratis, termasuk Mandalajati di utara dan Gedebage di selatan. Kawasan ini banyak dilewati pengendara motor harian, jadi cuci helm termasuk layanan yang paling sering diminta di sini.',
    kecamatan: ['Ujungberung', 'Mandalajati', 'Gedebage'],
    landmarks: [
      'Alun-alun Ujungberung',
      'Pasar Ujungberung',
      'Gedebage dan Summarecon',
      'Jalan Soekarno-Hatta sisi timur',
    ],
    pickupNote: 'Ujungberung dan Gedebage biasanya satu rute dengan Cibiru, umumnya sore.',
  },
  {
    slug: 'kopo',
    tier: 'place',
    name: 'Kopo',
    headline: 'Cuci Sepatu Kopo — Antar Jemput Gratis',
    title: 'Cuci Sepatu Kopo, Antar Jemput Gratis',
    description:
      'Cuci sepatu di kawasan Kopo, Margahayu, dan Bojongloa Kidul. Antar jemput gratis ke rumah dan perumahan sekitar.',
    intro:
      'Kopo bukan nama kecamatan — kawasan yang orang sebut Kopo membentang dari Bojongloa Kidul di Kota Bandung sampai Margahayu di Kabupaten Bandung. Keduanya masuk area antar jemput gratis kami, jadi Anda tidak perlu memastikan dulu masuk wilayah administrasi yang mana.',
    kecamatan: ['Bojongloa Kidul', 'Margahayu', 'Margaasih'],
    landmarks: [
      'Jalan Kopo dan Kopo Permai',
      'Sayati dan Margahayu Raya',
      'Kawasan Cibaduyut',
      'Pasar Kopo',
    ],
    pickupNote:
      'Jalan Kopo sering padat, jadi tim biasanya menjemput di luar jam sibuk. Kami konfirmasi jamnya sebelum berangkat.',
  },
  {
    slug: 'soreang',
    tier: 'place',
    name: 'Soreang',
    headline: 'Cuci Sepatu Soreang — Antar Jemput Gratis',
    title: 'Cuci Sepatu Soreang, Antar Jemput Gratis',
    description:
      'Cuci sepatu, tas, dan helm di Soreang dan Katapang. Antar jemput gratis, tanpa perlu ke Bandung kota.',
    intro:
      'Soreang cukup jauh dari pusat Kota Bandung, dan itu justru alasan antar jemput gratis paling berguna di sini: Anda tidak perlu menempuh perjalanan ke kota hanya untuk menitipkan sepatu. Soreang dan Katapang keduanya masuk area layanan kami.',
    kecamatan: ['Soreang', 'Katapang'],
    landmarks: [
      'Alun-alun Soreang',
      'Kompleks Pemkab Bandung',
      'Stadion Si Jalak Harupat',
      'Katapang dan Cingcin',
    ],
    pickupNote:
      'Soreang masuk rute selatan. Karena jaraknya, penjemputan diatur berbarengan dengan pelanggan lain di koridor yang sama.',
  },
  {
    slug: 'baleendah',
    tier: 'place',
    name: 'Baleendah',
    headline: 'Cuci Sepatu Baleendah — Antar Jemput Gratis',
    title: 'Cuci Sepatu Baleendah, Antar Jemput Gratis',
    description:
      'Cuci sepatu, tas, dan helm di Baleendah, Dayeuhkolot, dan Bojongsoang. Antar jemput gratis ke rumah.',
    intro:
      'Baleendah dan Dayeuhkolot termasuk area yang paling lama kami layani — sebagian pelanggan di sini sudah menitipkan sepatu sejak kami masih beroperasi dari Baleendah. Sekarang basecamp ada di Margacinta, tapi areanya tetap dilayani dengan antar jemput gratis.',
    kecamatan: ['Baleendah', 'Dayeuhkolot', 'Bojongsoang'],
    landmarks: [
      'Jalan Raya Baleendah',
      'Dayeuhkolot dan Citeureup',
      'Kawasan Bojongsoang',
      'Andir dan Rancamanyar',
    ],
    pickupNote:
      'Koridor Baleendah dan Dayeuhkolot dekat dengan basecamp, jadi penjemputannya termasuk yang paling cepat.',
  },
]

/** Look an area up by slug. */
export function findArea(slug: string) {
  return AREAS.find((area) => area.slug === slug)
}

export const AREA_TIER_LABEL: Record<AreaTier, string> = {
  hub: 'Wilayah',
  place: 'Kawasan',
  campus: 'Kampus',
}
