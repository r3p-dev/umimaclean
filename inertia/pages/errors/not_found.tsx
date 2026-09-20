import { publicLayout } from '~/layouts/public'
import { SITE } from '@content/business'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-5 pt-16 pb-20">
      <p className="text-sm font-medium tracking-wide text-ink-muted uppercase">Error 404</p>

      <h1 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">Halaman ini tidak ada</h1>

      <p className="mt-5 text-lg text-ink-body">
        Mungkin alamatnya salah ketik, atau halamannya sudah dipindahkan. Yang di bawah ini masih
        ada semua.
      </p>

      <ul className="mt-8 space-y-3">
        <li>
          <a className="text-ink underline hover:no-underline" href="/layanan">
            Empat layanan kami
          </a>
        </li>
        <li>
          <a className="text-ink underline hover:no-underline" href="/harga">
            Daftar harga
          </a>
        </li>
        <li>
          <a className="text-ink underline hover:no-underline" href="/area">
            Area antar jemput gratis
          </a>
        </li>
        <li>
          <a className="text-ink underline hover:no-underline" href="/kontak">
            Kontak dan alamat
          </a>
        </li>
      </ul>

      <a
        className="mt-10 inline-block bg-ink px-6 py-3 text-sm font-medium text-paper hover:bg-ink-body"
        href="/pesan"
      >
        Pesan sekarang
      </a>

      <p className="mt-4 text-sm text-ink-muted">
        Atau{' '}
        <a className="underline hover:no-underline" href={SITE.whatsapp}>
          tanya lewat WhatsApp
        </a>{' '}
        kalau ada yang ingin ditanyakan.
      </p>
    </div>
  )
}

NotFound.layout = publicLayout
