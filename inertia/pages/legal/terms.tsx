import LegalPage, { LegalList, LegalSection } from '~/components/organisms/legal_page'
import PublicLayout from '~/components/templates/public_layout'
import { usePage } from '@inertiajs/react'

export default function Terms() {
  const { store } = usePage().props
  const storeInfo = store ?? {
    name: 'Umima Clean',
    whatsapp: '6285157900974',
    address: 'Jl. Margacinta No. 132, Margasari, Buahbatu, Kota Bandung 40286',
    hours: '09.00–20.00',
  }
  const waDisplay = storeInfo.whatsapp.startsWith('62')
    ? '0' + storeInfo.whatsapp.slice(2)
    : storeInfo.whatsapp

  return (
    <LegalPage
      title="Syarat layanan"
      description={`Syarat pemesanan, pemeriksaan, pembayaran, dan pengembalian barang di ${storeInfo.name}.`}
      updated="14 November 2026"
    >
      <p>
        Syarat ini berlaku untuk pencucian sepatu, tas, dan helm di {storeInfo.name} (
        {storeInfo.address}), baik yang dipesan lewat situs ini maupun yang dibawa langsung ke toko.
      </p>
      <LegalSection title="Pemesanan dan penjemputan">
        <LegalList>
          <li>Pemesanan lewat situs memerlukan akun yang terverifikasi dengan nomor WhatsApp.</li>
          <li>
            Penjemputan dan pengantaran gratis untuk alamat di area layanan: Kota Bandung, Kota
            Cimahi, dan sebagian Kabupaten Bandung.
          </li>
          <li>Helm tidak dijemput. Helm dicuci jika dibawa langsung ke toko.</li>
          <li>
            Tanggal jemput bisa dipilih mulai besok sampai 7 hari ke depan, kecuali hari Minggu,
            pada salah satu rentang jam yang tersedia. Rentang yang sudah penuh tidak bisa dipilih.
          </li>
          <li>
            Pesanan bisa dibatalkan dari halaman pesanan selama kurir belum berangkat. Setelah itu,
            hubungi kami lewat WhatsApp.
          </li>
        </LegalList>
      </LegalSection>
      <LegalSection title="Pemeriksaan, tagihan, dan pembayaran">
        <LegalList>
          <li>
            Barang yang Anda isi saat memesan adalah perkiraan. Tim kami memeriksa setiap barang,
            mencatat kondisinya, lalu menentukan layanan dan harga sesuai daftar harga yang berlaku.
          </li>
          <li>
            Untuk layanan bertanda “mulai dari”, harga bisa lebih tinggi dari harga yang tertera,
            sesuai kondisi barang. Harga tidak pernah lebih rendah dari yang tertera.
          </li>
          <li>
            Tagihan dikirim lewat WhatsApp dan tampil di halaman pesanan. Pencucian dimulai setelah
            tagihan dibayar: dengan QRIS lewat situs, atau di kasir toko dengan QRIS atau tunai.
          </li>
          <li>Kode QRIS berlaku 15 menit. Jika habis, buat kode baru dari halaman pembayaran.</li>
          <li>Pertanyaan tentang tagihan bisa disampaikan lewat WhatsApp.</li>
        </LegalList>
      </LegalSection>
      <LegalSection title="Pengembalian barang">
        <LegalList>
          <li>
            Barang diantar kembali ke alamat yang dipilih saat memesan. Barang yang dibawa ke toko
            bisa diambil di toko atau diantar, sesuai pilihan saat transaksi.
          </li>
          <li>
            Kurir memotret barang saat menjemput dan mengantar, dan tim kami memotret barang setelah
            dicuci, sebagai bukti kondisinya.
          </li>
        </LegalList>
      </LegalSection>
      <LegalSection title="Kontak">
        <p>
          Pertanyaan atau keluhan: WhatsApp {waDisplay}, setiap hari {storeInfo.hours}.
        </p>
      </LegalSection>
    </LegalPage>
  )
}

Terms.layout = [PublicLayout]
