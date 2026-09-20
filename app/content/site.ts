/**
 * Homepage and shared copy: how the service works, why people choose it, the
 * FAQ, the terms, and the real customer reviews.
 *
 * The reviews are genuine, named Google reviews carried over from the previous
 * build. They are rendered for human readers only — no Review or
 * AggregateRating JSON-LD is emitted anywhere. Google does not show review
 * rich results for a LocalBusiness that controls the reviews on its own site,
 * so marking them up is zero upside and a manual-action risk.
 */

export type Step = { title: string; detail: string }
export type Benefit = { title: string; detail: string }
export type Faq = { question: string; answer: string }
export type Review = { name: string; rating: number; comment: string }

export const STEPS: readonly Step[] = [
  {
    title: 'Isi formulir pemesanan',
    detail:
      'Pilih layanan, kecamatan, dan tulis alamat beserta patokannya. Pesanan langsung masuk ke antrean, tidak tercecer di chat.',
  },
  {
    title: 'Kami jemput, gratis',
    detail:
      'Tim kami datang ke lokasi Anda di Bandung. Tidak ada ongkos jemput, berapa pun jumlah barangnya.',
  },
  {
    title: 'Inspeksi dan konfirmasi harga',
    detail:
      'Barang diperiksa, treatment ditentukan, harga akhir dikonfirmasi ke Anda sebelum dikerjakan.',
  },
  {
    title: 'Dikerjakan 2-4 hari',
    detail: 'Setiap bahan punya penanganan sendiri. Tidak ada yang dicuci asal cepat.',
  },
  {
    title: 'Diantar kembali, gratis',
    detail: 'Barang diantar balik ke alamat Anda. Sekali lagi, tanpa biaya antar.',
  },
]

export const BENEFITS: readonly Benefit[] = [
  {
    title: 'Antar jemput gratis se-Bandung',
    detail:
      'Ini bukan promo musiman. Jemput dan antar memang tidak kami tagih, di seluruh area layanan Bandung.',
  },
  {
    title: 'Treatment sesuai bahan',
    detail:
      'Kulit, kanvas, suede, nubuck, sampai cangkang helm punya metode masing-masing. Salah metode berarti barang rusak.',
  },
  {
    title: 'Harga dikonfirmasi di depan',
    detail:
      'Harga akhir disampaikan setelah inspeksi dan sebelum pengerjaan. Tidak ada biaya yang muncul belakangan.',
  },
  {
    title: 'Garansi hasil',
    detail:
      'Kalau hasilnya kurang maksimal, Anda bisa mengajukan pencucian ulang tanpa biaya tambahan.',
  },
]

export const FAQS: readonly Faq[] = [
  {
    question: 'Berapa lama proses pengerjaannya?',
    answer:
      'Rata-rata 2-4 hari kerja, tergantung jenis barang dan treatment yang dibutuhkan. Untuk sepatu tersedia One Day Service dengan biaya tambahan Rp10.000.',
  },
  {
    question: 'Bagaimana cara pesan?',
    answer:
      'Lewat formulir pemesanan di situs ini. Isi nama, nomor WhatsApp, kecamatan, alamat beserta patokannya, dan layanan yang Anda mau. Pesanan langsung masuk ke antrean kami, lalu tim menghubungi Anda untuk memastikan jadwal penjemputan. WhatsApp kami pakai untuk pertanyaan dan komplen, bukan untuk memesan — pesanan lewat chat mudah tercecer, sementara yang lewat formulir langsung tercatat lengkap.',
  },
  {
    question: 'Bagaimana penjemputannya diatur?',
    answer:
      'Setelah pesanan masuk, waktu penjemputan menyesuaikan rute jemput-antar hari itu, dan kami konfirmasikan jamnya sebelum tim berangkat. Kalau Anda tidak bisa bertemu langsung, barang boleh dititipkan lalu dikonfirmasi ke tim yang menghubungi.',
  },
  {
    question: 'Apakah antar jemputnya benar-benar gratis?',
    answer:
      'Ya. Penjemputan dan pengantaran tidak dikenakan biaya di seluruh area layanan kami di Bandung, berapa pun jumlah barang yang Anda titipkan.',
  },
  {
    question: 'Bahan apa saja yang bisa ditangani?',
    answer:
      'Sepatu berbahan kanvas, mesh, kulit, sintetis, suede, dan nubuck, termasuk boots dan sepatu anak. Tas berbahan canvas, fabric, kulit, dan nubuck dari ukuran kecil sampai extra large. Helm half face, full face, dan modular yang busanya bisa dilepas.',
  },
  {
    question: 'Apakah bisa mencuci sepatu berbahan suede atau kulit?',
    answer:
      'Bisa. Untuk suede tersedia Premium For Suede yang mengembalikan tekstur lembut dan warnanya. Sepatu kulit ditangani dengan cairan khusus, tidak direndam.',
  },
  {
    question: 'Bagaimana kalau sepatu saya ternyata tidak bisa diselamatkan?',
    answer:
      'Kami sampaikan apa adanya setelah inspeksi, sebelum Anda membayar apa pun. Kalau kerusakannya di luar batas yang bisa kami perbaiki, atau hasilnya tidak akan sepadan dengan biayanya, kami akan bilang dan barang dikembalikan tanpa biaya pengerjaan.',
  },
  {
    question: 'Apakah tersedia layanan reparasi dan repaint?',
    answer:
      'Ya. Repaint upper mulai Rp150.000 dan recolour midsole Rp180.000. Untuk reglue sol dan jahitan yang putus, harga dihitung setelah inspeksi karena tingkat kerusakannya berbeda-beda.',
  },
  {
    question: 'Apakah ada garansi?',
    answer:
      'Ada. Jika hasil kurang maksimal, Anda bisa mengajukan pencucian ulang. Untuk klaim kerusakan, sertakan foto kondisi barang sebelum treatment.',
  },
  {
    question: 'Bisa mencuci lebih dari satu pasang sekaligus?',
    answer: 'Bisa, dan tersedia potongan harga untuk pengerjaan beberapa pasang sekaligus.',
  },
  {
    question: 'Di mana lokasi Umima.clean?',
    answer:
      'Jl. Margacinta No.132, Kec. Buahbatu, Jawa Barat 40286. Buka setiap hari pukul 09.30-20.30. Anda juga bisa memakai antar jemput gratis tanpa perlu datang.',
  },
]

export const TERMS: readonly string[] = [
  'Isi formulir pemesanan dengan detail lokasi supaya tim penjemputan mudah menemukan titik jemput.',
  'Waktu penjemputan menyesuaikan rute jemput-antar hari itu. Jika tidak dapat bertemu langsung dengan tim, barang dapat dititipkan dan dikonfirmasi kepada tim yang menghubungi atau melalui admin.',
  'Treatment disesuaikan dengan jenis bahan dan tingkat kekotoran. Jika ada tambahan treatment, konfirmasi paling lambat saat invoice dikirim.',
  'Pengerjaan dimulai setelah pembayaran diterima.',
]

/**
 * Real Google reviews, shown to readers. Never marked up as structured data —
 * see the note at the top of this file.
 */
export const REVIEWS: readonly Review[] = [
  {
    name: 'Adryan Aulia P',
    rating: 5,
    comment:
      'Langganan dari 2021, dulu masih di Baleendah. Walaupun sekarang ngedrop sepatu jadi jauh, tapi bisa di-pickup and delivery.',
  },
  {
    name: 'Rheinna Tasya',
    rating: 5,
    comment:
      'Rekomendasi buat yang mau sepatu atau tasnya kinclong lagi, pelayanannya juga ramah poll.',
  },
  {
    name: 'Sendi Maulana',
    rating: 5,
    comment:
      'Tempatnya nyaman, pelayanannya ramah. Buat yang mau reglue jangan ragu, terbaik pokoknya.',
  },
  {
    name: 'Ria Belinda',
    rating: 5,
    comment:
      'Good service. Masnya edukatif, ngasih tahu bagian mana saja yang sulit dibersihkan dan yang riskan kalau dipaksakan. Hasilnya tetap maksimal. Trims Umima.',
  },
]
