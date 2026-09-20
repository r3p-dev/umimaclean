import Breadcrumbs from '~/components/breadcrumbs'
import { publicLayout } from '~/layouts/public'
import { SITE } from '@content/business'

export default function Contact() {
  return (
    <>
      <Breadcrumbs trail={[{ name: 'Kontak', url: '/kontak' }]} />

      <div className="mx-auto max-w-3xl px-5 pt-8 pb-14">
        <h1 className="text-3xl font-semibold text-ink sm:text-4xl">Hubungi Umima.clean</h1>

        <p className="mt-5 text-lg text-ink-body">
          Untuk memesan, isi formulir pemesanan — pesanan yang masuk lewat formulir langsung
          terjadwal, lengkap dengan alamat dan layanannya. WhatsApp kami pakai untuk pertanyaan dan
          komplen.
        </p>

        <a
          className="mt-8 inline-block bg-ink px-6 py-3 text-sm font-medium text-paper hover:bg-ink-body"
          href="/pesan"
        >
          Pesan sekarang
        </a>

        <p className="mt-4 text-sm text-ink-muted">
          Ada pertanyaan atau keluhan?{' '}
          <a className="underline hover:no-underline" href={SITE.whatsapp}>
            Hubungi kami di WhatsApp {SITE.telephoneDisplay}
          </a>
          .
        </p>

        {/*
          The NAP block, rendered from the same module that feeds the JSON-LD.
          It must stay identical to the Google Business Profile, character for
          character — that identity is what merges the two into one entity.
        */}
        <section className="mt-14" aria-labelledby="alamat">
          <h2 id="alamat" className="text-2xl font-semibold text-ink">
            Alamat &amp; jam buka
          </h2>

          <dl className="mt-6 space-y-5 text-ink-body">
            <div>
              <dt className="text-sm font-medium text-ink-muted">Nama</dt>
              <dd className="mt-1">{SITE.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-ink-muted">Alamat</dt>
              <dd className="mt-1">
                <address className="not-italic">{SITE.addressLine}</address>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-ink-muted">Telepon</dt>
              <dd className="mt-1">
                <a className="hover:underline" href={`tel:${SITE.telephone}`}>
                  {SITE.telephoneDisplay}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-ink-muted">Jam buka</dt>
              <dd className="mt-1">{SITE.openingHoursLabel}</dd>
            </div>
          </dl>
        </section>

        <section className="mt-14" aria-labelledby="jangkauan">
          <h2 id="jangkauan" className="text-2xl font-semibold text-ink">
            Area antar jemput
          </h2>
          <p className="mt-3 text-ink-body">
            Penjemputan dan pengantaran gratis di seluruh area layanan kami di Bandung. Anda tidak
            perlu datang ke tempat kami kecuali memang ingin.
          </p>
        </section>
      </div>
    </>
  )
}

Contact.layout = publicLayout
