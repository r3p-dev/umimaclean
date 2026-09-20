import Breadcrumbs from '~/components/breadcrumbs'
import PriceTable from '~/components/price_table'
import { publicLayout } from '~/layouts/public'
import { SERVICES, findService } from '@content/services'

/**
 * One component, four pages.
 *
 * Only the slug crosses the wire; the copy is read from the shared content
 * module. Each URL still serves genuinely different content — its own
 * headline, price table, process, and materials — which is what matters for
 * ranking. Sharing the rendering does not make them the same page.
 */
export default function ServicePage({ slug }: { slug: string }) {
  const service = findService(slug)

  if (!service) {
    return null
  }

  const others = SERVICES.filter((entry) => entry.slug !== slug)

  return (
    <>
      <Breadcrumbs
        trail={[
          { name: 'Layanan', url: '/layanan' },
          { name: service.name, url: service.path },
        ]}
      />

      <article className="mx-auto max-w-5xl px-5 pt-8 pb-14">
        <h1 className="max-w-3xl text-3xl font-semibold text-ink sm:text-4xl">
          {service.headline}
        </h1>

        <p className="mt-5 max-w-2xl text-lg text-ink-body">{service.intro}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          {/* The service is carried through, so the form opens already answered */}
          <a
            className="bg-ink px-6 py-3 text-sm font-medium text-paper hover:bg-ink-body"
            href={`/pesan?layanan=${service.slug}`}
          >
            Pesan sekarang
          </a>
          <a
            className="border border-ink px-6 py-3 text-sm font-medium text-ink hover:bg-ink hover:text-paper"
            href="/harga"
          >
            Semua harga
          </a>
        </div>

        <section className="mt-14" aria-labelledby="harga">
          <h2 id="harga" className="text-2xl font-semibold text-ink">
            Harga {service.name.toLowerCase()}
          </h2>
          <p className="mt-2 text-sm text-ink-muted">
            Harga akhir dikonfirmasi setelah inspeksi, sebelum pengerjaan dimulai. Antar jemput
            tidak ditagih.
          </p>
          <div className="mt-6">
            <PriceTable items={service.items} caption={`Daftar harga ${service.name}`} />
          </div>
        </section>

        <section className="mt-14" aria-labelledby="proses">
          <h2 id="proses" className="text-2xl font-semibold text-ink">
            Prosesnya
          </h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-2">
            {service.process.map((step, index) => (
              <li key={step.title}>
                <p className="text-sm font-medium text-ink-muted">Tahap {index + 1}</p>
                <h3 className="mt-1 text-base font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm text-ink-body">{step.detail}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-14" aria-labelledby="waktu">
          <h2 id="waktu" className="text-2xl font-semibold text-ink">
            Waktu pengerjaan
          </h2>
          <p className="mt-3 max-w-2xl text-ink-body">{service.turnaround}</p>
        </section>

        <section className="mt-14" aria-labelledby="ditangani">
          <h2 id="ditangani" className="text-2xl font-semibold text-ink">
            Yang kami tangani
          </h2>
          <ul className="mt-4 grid max-w-2xl gap-2 text-ink-body sm:grid-cols-2">
            {service.materials.map((material) => (
              <li key={material} className="text-sm">
                {material}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14 border-t border-line pt-10" aria-labelledby="area">
          <h2 id="area" className="text-2xl font-semibold text-ink">
            Antar jemput gratis
          </h2>
          <p className="mt-3 max-w-2xl text-ink-body">
            {service.name} sudah termasuk penjemputan dan pengantaran tanpa biaya di area layanan
            kami di Bandung.
          </p>
        </section>

        {/* Services link to each other, so a repair reader finds cleaning and back again. */}
        <section className="mt-14 border-t border-line pt-10" aria-labelledby="lainnya">
          <h2 id="lainnya" className="text-2xl font-semibold text-ink">
            Layanan lainnya
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {others.map((entry) => (
              <li key={entry.slug}>
                <a className="text-ink-body hover:underline" href={entry.path}>
                  {entry.name}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </>
  )
}

ServicePage.layout = publicLayout
