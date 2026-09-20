import Breadcrumbs from '~/components/breadcrumbs'
import PriceTable from '~/components/price_table'
import { publicLayout } from '~/layouts/public'
import { SERVICES } from '@content/services'

export default function Pricing() {
  return (
    <>
      <Breadcrumbs trail={[{ name: 'Harga', url: '/harga' }]} />

      <div className="mx-auto max-w-5xl px-5 pt-8 pb-14">
        <h1 className="text-3xl font-semibold text-ink sm:text-4xl">
          Daftar harga cuci sepatu, tas, helm &amp; reparasi
        </h1>

        <p className="mt-5 max-w-2xl text-lg text-ink-body">
          Harga di bawah ini berlaku apa adanya. Penjemputan dan pengantaran{' '}
          <strong className="font-semibold text-ink">tidak ditagih</strong> di seluruh area layanan
          kami di Bandung, berapa pun jumlah barang yang Anda titipkan.
        </p>

        <p className="mt-3 max-w-2xl text-sm text-ink-muted">
          Harga akhir dikonfirmasi setelah barang diperiksa dan sebelum dikerjakan, karena tingkat
          kekotoran dan bahan menentukan treatment yang dipakai. Tidak ada biaya yang muncul
          belakangan.
        </p>

        {SERVICES.map((service) => (
          <section key={service.slug} className="mt-14" aria-labelledby={service.slug}>
            <h2 id={service.slug} className="text-2xl font-semibold text-ink">
              <a className="hover:underline" href={service.path}>
                {service.name}
              </a>
            </h2>
            <p className="mt-2 text-sm text-ink-muted">{service.turnaround}</p>
            <div className="mt-6">
              <PriceTable items={service.items} caption={`Daftar harga ${service.name}`} />
            </div>
          </section>
        ))}

        <section className="mt-14 border-t border-line pt-10" aria-labelledby="reparasi-lain">
          <h2 id="reparasi-lain" className="text-2xl font-semibold text-ink">
            Reglue, jahit, dan penggantian bagian
          </h2>
          <p className="mt-3 max-w-2xl text-ink-body">
            Harga untuk reglue sol, jahitan yang putus, dan penggantian bagian tidak dipatok di
            muka, karena tingkat kerusakannya berbeda-beda. Kami periksa dulu, lalu sampaikan
            harganya sebelum ada yang dikerjakan. Pesan dulu lewat formulir; harga akhir
            dikonfirmasi setelah barang diperiksa.
          </p>
          <a
            className="mt-6 inline-block bg-ink px-6 py-3 text-sm font-medium text-paper hover:bg-ink-body"
            href="/pesan?layanan=reparasi-sepatu"
          >
            Pesan sekarang
          </a>
        </section>
      </div>
    </>
  )
}

Pricing.layout = publicLayout
