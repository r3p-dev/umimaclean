import Breadcrumbs from '~/components/breadcrumbs'
import { publicLayout } from '~/layouts/public'
import { SITE } from '@content/business'
import { SERVICES } from '@content/services'
import { COVERED_KECAMATAN } from '@content/areas'

export default function About() {
  return (
    <>
      <Breadcrumbs trail={[{ name: 'Tentang', url: '/tentang' }]} />

      <div className="mx-auto max-w-3xl px-5 pt-8 pb-14">
        <h1 className="text-3xl font-semibold text-ink sm:text-4xl">Tentang {SITE.name}</h1>

        <p className="mt-5 text-lg text-ink-body">
          Kami merawat sepatu, tas, dan helm — mencucinya sesuai bahan, dan memperbaikinya kalau
          masih bisa diperbaiki. Basecamp kami di Margacinta, Buahbatu, dan sebagian besar pelanggan
          tidak pernah datang ke sana: barangnya kami jemput dan antar kembali tanpa biaya.
        </p>

        <section className="mt-14" aria-labelledby="cara-kami">
          <h2 id="cara-kami" className="text-2xl font-semibold text-ink">
            Cara kami bekerja
          </h2>
          <p className="mt-3 text-ink-body">
            Setiap barang diperiksa dulu sebelum dikerjakan. Bahan menentukan metodenya — sabun dan
            sikat yang aman untuk kanvas akan merusak suede, dan tas kulit tidak boleh direndam.
            Karena itu harga akhir baru dipastikan setelah inspeksi, dan selalu dikonfirmasi ke Anda
            sebelum ada yang dikerjakan.
          </p>
          <p className="mt-3 text-ink-body">
            Kalau kerusakannya di luar batas yang bisa kami perbaiki, kami bilang apa adanya dan
            barang dikembalikan tanpa biaya pengerjaan. Menyarankan perbaikan yang tidak sepadan
            dengan biayanya bukan cara kami mencari pelanggan tetap.
          </p>
        </section>

        <section className="mt-14" aria-labelledby="layanan-kami">
          <h2 id="layanan-kami" className="text-2xl font-semibold text-ink">
            Empat layanan
          </h2>
          <ul className="mt-4 space-y-2 text-ink-body">
            {SERVICES.map((service) => (
              <li key={service.slug}>
                <a className="underline hover:no-underline" href={service.path}>
                  {service.name}
                </a>{' '}
                — {service.turnaround}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14" aria-labelledby="jangkauan">
          <h2 id="jangkauan" className="text-2xl font-semibold text-ink">
            Jangkauan
          </h2>
          <p className="mt-3 text-ink-body">
            Antar jemput gratis ke {COVERED_KECAMATAN.length} kecamatan di Kota Bandung, Kota
            Cimahi, dan sebagian Kabupaten Bandung.{' '}
            <a className="underline hover:no-underline" href="/area">
              Lihat peta dan daftar lengkapnya
            </a>
            , termasuk kecamatan yang belum kami jangkau.
          </p>
        </section>

        {/*
          The NAP block, from the same module that feeds the JSON-LD, so this
          page and the structured data cannot disagree with the Google Business
          Profile.
        */}
        <section className="mt-14" aria-labelledby="identitas">
          <h2 id="identitas" className="text-2xl font-semibold text-ink">
            Alamat dan jam buka
          </h2>
          <address className="mt-3 text-ink-body not-italic">
            {SITE.name}
            <br />
            {SITE.addressLine}
            <br />
            <a className="hover:underline" href={`tel:${SITE.telephone}`}>
              {SITE.telephoneDisplay}
            </a>
            <br />
            {SITE.openingHoursLabel}
          </address>
          <p className="mt-4 text-sm text-ink-muted">
            Untuk memesan, gunakan{' '}
            <a className="underline hover:no-underline" href="/pesan">
              formulir pemesanan
            </a>
            . WhatsApp kami pakai untuk pertanyaan dan komplen.
          </p>
        </section>
      </div>
    </>
  )
}

About.layout = publicLayout
