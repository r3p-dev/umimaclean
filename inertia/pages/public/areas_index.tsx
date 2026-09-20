import Breadcrumbs from '~/components/breadcrumbs'
import CoverageMap from '~/components/coverage_map'
import { publicLayout } from '~/layouts/public'
import { SITE } from '@content/business'
import {
  AREAS,
  KOTA_BANDUNG,
  KOTA_CIMAHI,
  KABUPATEN_BANDUNG,
  COVERED_KECAMATAN,
  NOT_COVERED_KECAMATAN,
} from '@content/areas'

/**
 * The coverage page.
 *
 * The lists are the point. "Apakah Padalarang masuk area" is answered by text,
 * and text is what gets indexed — so both the covered and the not-covered
 * kecamatan are written out in full rather than summarised. Saying plainly
 * where we do not go captures the query, saves the customer a message, and
 * reads as honest.
 */
function KecamatanList({ title, names }: { title: string; names: readonly string[] }) {
  return (
    <div>
      <h3 className="text-base font-semibold text-ink">
        {title} <span className="font-normal text-ink-muted">({names.length} kecamatan)</span>
      </h3>
      <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-ink-body">
        {names.map((name) => (
          <li
            key={name}
            className="after:ml-3 after:text-ink-muted after:content-['·'] last:after:content-['']"
          >
            {name}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function AreasIndex() {
  const hubs = AREAS.filter((area) => area.tier === 'hub')
  const places = AREAS.filter((area) => area.tier === 'place')
  const campuses = AREAS.filter((area) => area.tier === 'campus')

  return (
    <>
      <Breadcrumbs trail={[{ name: 'Area', url: '/area' }]} />

      <div className="mx-auto max-w-5xl px-5 pt-8 pb-14">
        <h1 className="max-w-3xl text-3xl font-semibold text-ink sm:text-4xl">
          Area antar jemput gratis
        </h1>

        <p className="mt-5 max-w-2xl text-lg text-ink-body">
          Kami menjemput dan mengantar tanpa biaya di{' '}
          <strong className="font-semibold text-ink">{COVERED_KECAMATAN.length} kecamatan</strong>{' '}
          di Kota Bandung, Kota Cimahi, dan sebagian Kabupaten Bandung. Kalau kecamatan Anda ada di
          daftar ini, tidak ada ongkos jemput sama sekali.
        </p>

        <CoverageMap />

        <section className="mt-12" aria-labelledby="terjangkau">
          <h2 id="terjangkau" className="text-2xl font-semibold text-ink">
            Kecamatan yang terjangkau
          </h2>
          <div className="mt-6 space-y-8">
            <KecamatanList title="Kota Bandung" names={KOTA_BANDUNG} />
            <KecamatanList title="Kota Cimahi" names={KOTA_CIMAHI} />
            <KecamatanList title="Kabupaten Bandung" names={KABUPATEN_BANDUNG} />
          </div>
        </section>

        <section className="mt-14" aria-labelledby="halaman-area">
          <h2 id="halaman-area" className="text-2xl font-semibold text-ink">
            Halaman per wilayah
          </h2>

          <div className="mt-6 grid gap-8 sm:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold text-ink-muted uppercase">Wilayah</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {hubs.map((area) => (
                  <li key={area.slug}>
                    <a className="text-ink-body hover:underline" href={`/area/${area.slug}`}>
                      {area.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink-muted uppercase">Kawasan</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {places.map((area) => (
                  <li key={area.slug}>
                    <a className="text-ink-body hover:underline" href={`/area/${area.slug}`}>
                      {area.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink-muted uppercase">Kampus</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {campuses.map((area) => (
                  <li key={area.slug}>
                    <a className="text-ink-body hover:underline" href={`/area/${area.slug}`}>
                      {area.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/*
          Being straightforwardly useful about where we do not go. Cimahi must
          never appear in this list — it is covered, and a stale entry here
          would turn a real customer away.
        */}
        <section className="mt-14 border-t border-line pt-10" aria-labelledby="belum">
          <h2 id="belum" className="text-2xl font-semibold text-ink">
            Belum terjangkau
          </h2>
          <p className="mt-3 max-w-2xl text-ink-body">
            Supaya Anda tidak perlu bertanya dulu: kecamatan berikut{' '}
            <strong className="font-semibold text-ink">belum</strong> masuk area antar jemput gratis
            kami.
          </p>
          <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-sm text-ink-body">
            {NOT_COVERED_KECAMATAN.map((name) => (
              <li
                key={name}
                className="after:ml-3 after:text-ink-muted after:content-['·'] last:after:content-['']"
              >
                {name}
              </li>
            ))}
          </ul>
          <p className="mt-4 max-w-2xl text-sm text-ink-muted">
            Anda masih bisa mengantar sendiri ke {SITE.addressLine}. Kalau kecamatan Anda ada di
            daftar terjangkau, langsung saja{' '}
            <a className="underline hover:no-underline" href="/pesan">
              pesan lewat formulir
            </a>
            .
          </p>
        </section>
      </div>
    </>
  )
}

AreasIndex.layout = publicLayout
