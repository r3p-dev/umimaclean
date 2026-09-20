import { usePage } from '@inertiajs/react'

import { publicLayout } from '~/layouts/public'
import { SITE } from '@content/business'
import { SERVICES } from '@content/services'
import { COVERED_KECAMATAN, NOT_COVERED_KECAMATAN } from '@content/areas'
import Breadcrumbs from '~/components/breadcrumbs'

/**
 * The booking form.
 *
 * A plain HTML form that posts and redirects, with no JavaScript involved at
 * any point. That is not nostalgia: this is the page an order arrives through,
 * and it should not stop working because a bundle failed to load on a phone
 * with two bars of signal.
 *
 * The kecamatan field is a select drawn from the coverage list rather than a
 * text input. Someone outside the area finds that out here, in a second,
 * instead of after they have been promised a free pickup.
 */
export default function OrderPage({
  preselected,
  csrfToken,
}: {
  preselected: string | null
  csrfToken: string
}) {
  const page = usePage()
  const errors = (page.props.errors ?? {}) as Record<string, string>
  const success = page.flash?.success

  const field = 'mt-2 w-full border border-line bg-paper px-3 py-2 text-ink'
  const label = 'block text-sm font-medium text-ink'

  return (
    <>
      <Breadcrumbs trail={[{ name: 'Pesan', url: '/pesan' }]} />

      <div className="mx-auto max-w-3xl px-5 pt-8 pb-14">
        <h1 className="text-3xl font-semibold text-ink sm:text-4xl">Pesan sekarang</h1>

        <p className="mt-5 max-w-2xl text-lg text-ink-body">
          Isi formulir ini dan tim kami menghubungi Anda untuk memastikan jadwal penjemputan.
          Penjemputan dan pengantaran gratis di seluruh area layanan kami.
        </p>

        {success && (
          <p
            role="status"
            className="mt-8 border-l-2 border-ink bg-paper-tint px-5 py-4 text-ink-body"
          >
            {success}
          </p>
        )}

        <form method="post" action="/pesan" className="mt-10 space-y-6">
          <input type="hidden" name="_csrf" value={csrfToken} />

          <div>
            <label className={label} htmlFor="name">
              Nama
            </label>
            <input className={field} id="name" name="name" autoComplete="name" required />
            {errors.name && (
              <p className="mt-1 text-sm text-ink" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label className={label} htmlFor="phone">
              Nomor WhatsApp
            </label>
            <input
              className={field}
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="08xxxxxxxxxx"
              required
              aria-describedby="phone-help"
            />
            <p id="phone-help" className="mt-1 text-sm text-ink-muted">
              Dipakai untuk konfirmasi jadwal jemput, bukan untuk memesan lewat chat.
            </p>
            {errors.phone && (
              <p className="mt-1 text-sm text-ink" role="alert">
                {errors.phone}
              </p>
            )}
          </div>

          <div>
            <label className={label} htmlFor="serviceSlug">
              Layanan
            </label>
            <select
              className={field}
              id="serviceSlug"
              name="serviceSlug"
              defaultValue={preselected ?? ''}
              required
            >
              <option value="" disabled>
                Pilih layanan
              </option>
              {SERVICES.map((service) => (
                <option key={service.slug} value={service.slug}>
                  {service.name}
                </option>
              ))}
            </select>
            {errors.serviceSlug && (
              <p className="mt-1 text-sm text-ink" role="alert">
                {errors.serviceSlug}
              </p>
            )}
          </div>

          <div>
            <label className={label} htmlFor="kecamatan">
              Kecamatan
            </label>
            <select className={field} id="kecamatan" name="kecamatan" required defaultValue="">
              <option value="" disabled>
                Pilih kecamatan
              </option>
              {COVERED_KECAMATAN.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-ink-muted">
              Hanya kecamatan yang kami jangkau yang ada di daftar ini.{' '}
              <a className="underline hover:no-underline" href="/area">
                Lihat area lengkapnya
              </a>
              .
            </p>
            {errors.kecamatan && (
              <p className="mt-1 text-sm text-ink" role="alert">
                {errors.kecamatan}
              </p>
            )}
          </div>

          <div>
            <label className={label} htmlFor="addressNote">
              Alamat dan patokan
            </label>
            <textarea
              className={field}
              id="addressNote"
              name="addressNote"
              rows={3}
              required
              aria-describedby="address-help"
            />
            <p id="address-help" className="mt-1 text-sm text-ink-muted">
              Tulis selengkap mungkin — nama gang, warna pagar, warung terdekat. Peta di Bandung
              sering tidak punya nomor rumah, jadi patokan tertulis yang paling menolong.
            </p>
            {errors.addressNote && (
              <p className="mt-1 text-sm text-ink" role="alert">
                {errors.addressNote}
              </p>
            )}
          </div>

          <div>
            <label className={label} htmlFor="notes">
              Catatan (opsional)
            </label>
            <textarea className={field} id="notes" name="notes" rows={2} />
            {errors.notes && (
              <p className="mt-1 text-sm text-ink" role="alert">
                {errors.notes}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="bg-ink px-6 py-3 text-sm font-medium text-paper hover:bg-ink-body"
          >
            Kirim pesanan
          </button>
        </form>

        <section className="mt-14 border-t border-line pt-10" aria-labelledby="belum-terjangkau">
          <h2 id="belum-terjangkau" className="text-xl font-semibold text-ink">
            Kecamatan Anda tidak ada di daftar?
          </h2>
          <p className="mt-3 text-ink-body">
            Berarti kami belum menjangkau ke sana. Yang belum terjangkau saat ini:{' '}
            {NOT_COVERED_KECAMATAN.join(', ')}. Anda masih bisa mengantar sendiri ke{' '}
            {SITE.addressLine}.
          </p>
        </section>
      </div>
    </>
  )
}

OrderPage.layout = publicLayout
