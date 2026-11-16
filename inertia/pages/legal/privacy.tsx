import LegalPage, { LegalList, LegalSection } from '~/components/organisms/legal_page'
import PublicLayout from '~/components/templates/public_layout'
import { usePage } from '@inertiajs/react'

// PHOTO-3: proof photo files are deleted after this many days.
const PHOTO_RETENTION_DAYS = 90

export default function Privacy() {
  const { store } = usePage().props
  const storeName = store?.name ?? 'Umima Clean'

  return (
    <LegalPage
      title="Kebijakan privasi"
      description={`Data apa yang disimpan ${storeName}, untuk apa, berapa lama, dan pihak lain mana yang menerimanya.`}
      updated="14 November 2026"
    >
      <p>
        Halaman ini menjelaskan data apa yang disimpan {storeName}, untuk apa, berapa lama, dan
        pihak lain mana yang menerimanya.
      </p>
      <LegalSection title="Data yang kami simpan">
        <LegalList>
          <li>Akun: nama, nomor WhatsApp, dan kata sandi (hanya dalam bentuk hash).</li>
          <li>
            Alamat tersimpan: label, nama dan nomor penerima, alamat, patokan, dan titik peta.
            Setiap pesanan menyalin alamatnya, jadi mengubah alamat tidak mengubah pesanan lama.
          </li>
          <li>Pesanan: barang, catatan, jadwal, layanan, tagihan, dan pembayaran.</li>
          <li>
            Foto bukti dari kurir dan workshop. File foto dihapus otomatis setelah{' '}
            {PHOTO_RETENTION_DAYS} hari; catatan siapa melakukan apa dan kapan tetap disimpan.
          </li>
        </LegalList>
      </LegalSection>
      <LegalSection title="Untuk apa data dipakai">
        <LegalList>
          <li>Menjemput, memproses, dan mengantar pesanan Anda.</li>
          <li>Mengirim kode verifikasi dan kabar pesanan lewat WhatsApp.</li>
          <li>Membuat tagihan dan menerima pembayaran QRIS lewat penyedia pembayaran.</li>
        </LegalList>
      </LegalSection>
      <LegalSection title="Pihak lain yang menerima data">
        <LegalList>
          <li>Fonnte, untuk mengirim pesan WhatsApp: nomor WhatsApp dan isi pesan.</li>
          <li>
            Midtrans, untuk pembayaran QRIS: nomor pesanan, jumlah tagihan, serta nama dan nomor
            WhatsApp Anda.
          </li>
          <li>
            Cloudflare Turnstile, untuk pemeriksaan anti-bot di formulir: token pemeriksaan dan
            alamat IP.
          </li>
          <li>
            Google Maps atau Waze, saat staf membuka navigasi di ponselnya: hanya menerima titik
            koordinat tujuan, tidak pernah menerima nama, nomor telepon, atau pesanan Anda.
          </li>
        </LegalList>
        <p>
          Peta, pencarian alamat, pengecekan area layanan, serta rute dan perkiraan jarak untuk
          kurir diproses di server kami sendiri dengan data OpenStreetMap (© kontributor
          OpenStreetMap). Data tersebut tidak dikirim ke pihak lain.
        </p>
      </LegalSection>
      <LegalSection title="Hak Anda">
        <p>
          Anda bisa mengubah nama, nomor, kata sandi, dan alamat di halaman Profil, serta
          mengeluarkan akun dari perangkat lain. Untuk menghapus akun, hubungi WhatsApp{' '}
          {store?.whatsapp
            ? store.whatsapp.startsWith('62')
              ? '0' + store.whatsapp.slice(2)
              : store.whatsapp
            : '0851-5790-0974'}
          .
        </p>
      </LegalSection>
    </LegalPage>
  )
}

Privacy.layout = [PublicLayout]
