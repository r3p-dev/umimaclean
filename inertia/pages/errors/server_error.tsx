import { publicLayout } from '~/layouts/public'
import { SITE } from '@content/business'

export default function ServerError() {
  return (
    <div className="mx-auto max-w-3xl px-5 pt-16 pb-20">
      <p className="text-sm font-medium tracking-wide text-ink-muted uppercase">Error 500</p>

      <h1 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">Ada yang bermasalah</h1>

      <p className="mt-5 text-lg text-ink-body">
        Kesalahan ini dari sisi kami, bukan dari Anda. Coba muat ulang sebentar lagi. Kalau Anda
        sedang ingin memesan, hubungi kami langsung saja — lebih cepat.
      </p>

      <a
        className="mt-8 inline-block bg-ink px-6 py-3 text-sm font-medium text-paper hover:bg-ink-body"
        href={SITE.whatsapp}
      >
        Hubungi lewat WhatsApp
      </a>
    </div>
  )
}

ServerError.layout = publicLayout
