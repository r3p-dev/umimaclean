import { publicLayout } from '~/layouts/public'
import { SITE } from '@content/business'
import { SERVICES, rupiah, priceFrom } from '@content/services'
import { STEPS, BENEFITS, REVIEWS } from '@content/site'

export default function Home() {
  return (
    <>
      <section className="mx-auto max-w-5xl px-5 pt-16 pb-14">
        <p className="text-sm font-medium tracking-wide text-ink-muted uppercase">
          Bandung · Antar jemput gratis
        </p>

        <h1 className="mt-4 max-w-3xl text-4xl leading-tight font-semibold text-ink sm:text-5xl">
          Cuci &amp; reparasi sepatu, tas, dan helm di Bandung
        </h1>

        <p className="mt-5 max-w-2xl text-lg text-ink-body">
          Kami jemput barang Anda, kerjakan sesuai bahannya, lalu antar kembali ke alamat Anda.
          Penjemputan dan pengantaran <strong className="font-semibold text-ink">gratis</strong>,
          berapa pun jumlah barangnya.
        </p>

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
            Lihat daftar harga
          </a>
        </div>

        <p className="mt-6 text-sm text-ink-muted">
          Buka setiap hari 09.30–20.30 · {SITE.telephoneDisplay}
        </p>
      </section>

      <section className="border-t border-line bg-paper-tint" aria-labelledby="layanan">
        <div className="mx-auto max-w-5xl px-5 py-14">
          <h2 id="layanan" className="text-2xl font-semibold text-ink">
            Empat layanan
          </h2>

          <ul className="mt-8 grid gap-6 sm:grid-cols-2">
            {SERVICES.map((service) => (
              <li key={service.slug} className="border border-line bg-paper p-6">
                <h3 className="text-lg font-semibold text-ink">
                  <a className="hover:underline" href={service.path}>
                    {service.name}
                  </a>
                </h3>
                <p className="mt-2 text-sm text-ink-muted">{service.description}</p>
                <p className="mt-4 text-sm font-medium text-ink">
                  Mulai {rupiah(priceFrom(service))}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-14" aria-labelledby="cara-kerja">
        <h2 id="cara-kerja" className="text-2xl font-semibold text-ink">
          Cara kerjanya
        </h2>

        <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <p className="text-sm font-medium text-ink-muted">Langkah {index + 1}</p>
              <h3 className="mt-1 text-base font-semibold text-ink">{step.title}</h3>
              <p className="mt-2 text-sm text-ink-body">{step.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-line bg-paper-tint" aria-labelledby="kenapa">
        <div className="mx-auto max-w-5xl px-5 py-14">
          <h2 id="kenapa" className="text-2xl font-semibold text-ink">
            Kenapa Umima.clean
          </h2>

          <ul className="mt-8 grid gap-6 sm:grid-cols-2">
            {BENEFITS.map((benefit) => (
              <li key={benefit.title}>
                <h3 className="text-base font-semibold text-ink">{benefit.title}</h3>
                <p className="mt-2 text-sm text-ink-body">{benefit.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/*
        Real, named Google reviews, shown for readers only. No Review or
        AggregateRating markup is emitted anywhere — Google does not show
        review rich results for a business that controls the reviews on its
        own site, so marking these up would be zero upside and real risk.
      */}
      <section className="mx-auto max-w-5xl px-5 py-14" aria-labelledby="ulasan">
        <h2 id="ulasan" className="text-2xl font-semibold text-ink">
          Kata pelanggan
        </h2>

        <ul className="mt-8 grid gap-6 sm:grid-cols-2">
          {REVIEWS.map((review) => (
            <li key={review.name} className="border-l-2 border-line pl-5">
              <blockquote className="text-sm text-ink-body">{review.comment}</blockquote>
              <p className="mt-3 text-sm font-medium text-ink">{review.name}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-line bg-paper-tint" aria-labelledby="area">
        <div className="mx-auto max-w-5xl px-5 py-14">
          <h2 id="area" className="text-2xl font-semibold text-ink">
            Area antar jemput gratis
          </h2>
          <p className="mt-4 max-w-2xl text-ink-body">
            Kami menjemput dan mengantar tanpa biaya di area layanan kami di Bandung. Belum yakin
            alamat Anda masuk? Tanyakan saja lewat WhatsApp — kami jawab apa adanya.
          </p>
          <a
            className="mt-6 inline-block bg-ink px-6 py-3 text-sm font-medium text-paper hover:bg-ink-body"
            href="/area"
          >
            Cek area layanan
          </a>
        </div>
      </section>
    </>
  )
}

Home.layout = publicLayout
