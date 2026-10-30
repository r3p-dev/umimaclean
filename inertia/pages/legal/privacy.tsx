import LegalPage from '~/components/organisms/legal_page'
import CustomerLayout from '~/components/templates/customer_layout'

type Store = { name: string; whatsapp: string; address: string; hours: string }

export default function Privacy({ store, photoDays }: { store: Store; photoDays: number }) {
  return (
    <LegalPage title="Kebijakan privasi" updated="21 Oktober 2026">
      <p>
        Halaman ini menjelaskan data apa yang disimpan {store.name}, untuk apa, dan berapa lama.
      </p>
      <section className="flex flex-col gap-2">
        <h2>Data yang kami simpan</h2>
        <ul>
          <li>Akun: nama, nomor WhatsApp, dan kata sandi (disimpan dalam bentuk hash).</li>
          <li>
            Alamat tersimpan: label, nama penerima, alamat, patokan, dan titik peta. Setiap pesanan
            menyalin alamatnya, jadi mengubah alamat tidak mengubah pesanan lama.
          </li>
          <li>Pesanan: jumlah barang, catatan, jadwal, layanan, tagihan, dan pembayaran.</li>
          <li>
            Foto bukti dari kurir dan workshop. Foto dihapus otomatis setelah {photoDays} hari;
            catatan siapa melakukan apa dan kapan tetap disimpan.
          </li>
        </ul>
      </section>
      <section className="flex flex-col gap-2">
        <h2>Untuk apa data dipakai</h2>
        <ul>
          <li>Menjemput, memproses, dan mengantar pesanan Anda.</li>
          <li>Mengirim kode verifikasi dan kabar pesanan lewat WhatsApp.</li>
          <li>Membuat tagihan dan menerima pembayaran QRIS lewat penyedia pembayaran.</li>
        </ul>
      </section>
      <section className="flex flex-col gap-2">
        <h2>Pihak lain</h2>
        <ul>
          <li>Fonnte, untuk mengirim pesan WhatsApp.</li>
          <li>
            Midtrans, untuk pembayaran QRIS (nama, nomor WhatsApp, nomor pesanan, dan total
            tagihan).
          </li>
          <li>Cloudflare Turnstile, untuk pemeriksaan anti-bot.</li>
          <li>
            Google Maps atau Waze, saat kurir membuka navigasi. Koordinat titik tujuan dikirim ke
            aplikasi tersebut.
          </li>
        </ul>
        <p>
          Gambar peta disiapkan oleh Protomaps dari data OpenStreetMap dan disajikan dari server
          kami sendiri. Pencarian alamat, saran lokasi, nama jalan untuk titik di peta, pengecekan
          area layanan, serta rute dan perkiraan jarak untuk kurir juga diproses di server kami
          dengan data OpenStreetMap (© kontributor OpenStreetMap). Area peta yang Anda lihat, teks
          pencarian, titik lokasi, dan posisi kurir untuk fitur ini tidak dikirim ke pihak lain.
        </p>
      </section>
      <section className="flex flex-col gap-2">
        <h2>Hak Anda</h2>
        <p>
          Anda bisa mengubah nama, nomor, kata sandi, dan alamat di halaman Profil, serta
          mengeluarkan perangkat lain. Untuk menghapus akun, hubungi WhatsApp {store.whatsapp}.
        </p>
      </section>
    </LegalPage>
  )
}

Privacy.layout = [CustomerLayout]
