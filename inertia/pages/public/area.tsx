import Breadcrumbs from '~/components/breadcrumbs'
import CoverageMap from '~/components/coverage_map'
import { publicLayout } from '~/layouts/public'
import { findArea, AREA_TIER_LABEL } from '@content/areas'
import { SERVICES, rupiah, priceFrom } from '@content/services'

/**
 * One area page.
 *
 * Only the slug crosses the wire; the copy comes from the shared content
 * module. Each page speaks about a real place — its kecamatan, its landmarks,
 * how pickup actually runs there — because a template that only swaps the
 * place name is a doorway page, and Google treats it as one.
 */
export default function AreaPage({ slug }: { slug: string }) {
  const area = findArea(slug)

  if (!area) {
    return null
  }

  return (
    <>
      <Breadcrumbs
        trail={[
          { name: 'Area', url: '/area' },
          { name: area.name, url: `/area/${area.slug}` },
        ]}
      />

      <article className="mx-auto max-w-5xl px-5 pt-8 pb-14">
        <p className="text-sm font-medium tracking-wide text-ink-muted uppercase">
          {AREA_TIER_LABEL[area.tier]} · Antar jemput gratis
        </p>

        <h1 className="mt-3 max-w-3xl text-3xl font-semibold text-ink sm:text-4xl">
          {area.headline}
        </h1>

        <p className="mt-5 max-w-2xl text-lg text-ink-body">{area.intro}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            className="bg-ink px-6 py-3 text-sm font-medium text-paper hover:bg-ink-body"
            href="/pesan"
          >
            Pesan sekarang
          </a>
          <a
            className="border border-ink px-6 py-3 text-sm font-medium text-ink hover:bg-ink hover:text-paper"
            href="/harga"
          >
            Lihat harga
          </a>
        </div>

        <section className="mt-14" aria-labelledby="cakupan">
          <h2 id="cakupan" className="text-2xl font-semibold text-ink">
            Kecamatan yang dijangkau
          </h2>
          <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-ink-body">
            {area.kecamatan.map((name) => (
              <li
                key={name}
                className="after:ml-3 after:text-ink-muted after:content-['·'] last:after:content-['']"
              >
                {name}
              </li>
            ))}
          </ul>
          <p className="mt-4 max-w-2xl text-sm text-ink-muted">{area.pickupNote}</p>

          <CoverageMap
            highlight={area.kecamatan}
            label={`Peta area antar jemput gratis, dengan ${area.name} ditandai. Daftar kecamatan lengkap ada di halaman area.`}
          />
        </section>

        <section className="mt-14" aria-labelledby="patokan">
          <h2 id="patokan" className="text-2xl font-semibold text-ink">
            Patokan yang biasa kami datangi
          </h2>
          <ul className="mt-4 grid max-w-2xl gap-2 text-ink-body sm:grid-cols-2">
            {area.landmarks.map((landmark) => (
              <li key={landmark} className="text-sm">
                {landmark}
              </li>
            ))}
          </ul>
        </section>

        {/*
          Campuses get their own headings, not a passing mention: students search
          by campus name and never by kecamatan, so the campus term has to be a
          real heading for the page to answer that query.
        */}
        {area.campuses && area.campuses.length > 0 && (
          <section className="mt-14" aria-labelledby="kampus">
            <h2 id="kampus" className="text-2xl font-semibold text-ink">
              Kampus di area ini
            </h2>
            <div className="mt-6 space-y-6">
              {area.campuses.map((campus) => (
                <div key={campus.name}>
                  <h3 className="text-base font-semibold text-ink">{campus.name}</h3>
                  <p className="text-sm text-ink-muted">Kecamatan {campus.kecamatan}</p>
                  <p className="mt-2 max-w-2xl text-ink-body">{campus.detail}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-14" aria-labelledby="layanan-area">
          <h2 id="layanan-area" className="text-2xl font-semibold text-ink">
            Layanan di {area.name}
          </h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2">
            {SERVICES.map((service) => (
              <li key={service.slug} className="border border-line bg-paper-tint p-6">
                <h3 className="text-base font-semibold text-ink">
                  <a className="hover:underline" href={service.path}>
                    {service.name}
                  </a>
                </h3>
                <p className="mt-2 text-sm text-ink-muted">{service.description}</p>
                <p className="mt-3 text-sm font-medium text-ink">
                  Mulai {rupiah(priceFrom(service))}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14 border-t border-line pt-10" aria-labelledby="area-lain">
          <h2 id="area-lain" className="text-2xl font-semibold text-ink">
            Area lainnya
          </h2>
          <p className="mt-3 text-ink-body">
            Lihat{' '}
            <a className="underline hover:no-underline" href="/area">
              seluruh area antar jemput gratis
            </a>{' '}
            untuk daftar lengkap kecamatan yang kami jangkau — dan yang belum.
          </p>
        </section>
      </article>
    </>
  )
}

AreaPage.layout = publicLayout
