import Breadcrumbs from '~/components/breadcrumbs'
import { publicLayout } from '~/layouts/public'
import { SERVICES, rupiah, priceFrom } from '@content/services'

export default function ServicesIndex() {
  return (
    <>
      <Breadcrumbs trail={[{ name: 'Layanan', url: '/layanan' }]} />

      <div className="mx-auto max-w-5xl px-5 pt-8 pb-14">
        <h1 className="text-3xl font-semibold text-ink sm:text-4xl">Layanan Umima.clean</h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-body">
          Empat layanan, masing-masing dengan penanganan sendiri. Semuanya sudah termasuk antar
          jemput gratis di area layanan kami di Bandung.
        </p>

        <ul className="mt-10 grid gap-6 sm:grid-cols-2">
          {SERVICES.map((service) => (
            <li key={service.slug} className="border border-line bg-paper-tint p-6">
              <h2 className="text-lg font-semibold text-ink">
                <a className="hover:underline" href={service.path}>
                  {service.name}
                </a>
              </h2>
              <p className="mt-2 text-sm text-ink-muted">{service.description}</p>
              <dl className="mt-4 text-sm text-ink-body">
                <dt className="sr-only">Harga mulai</dt>
                <dd className="font-medium text-ink">Mulai {rupiah(priceFrom(service))}</dd>
                <dt className="mt-2 sr-only">Waktu pengerjaan</dt>
                <dd className="text-ink-muted">{service.turnaround}</dd>
              </dl>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

ServicesIndex.layout = publicLayout
