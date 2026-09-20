import type { ReactNode } from 'react'
import { SITE } from '@content/business'
import { SERVICES } from '@content/services'
import { AREAS } from '@content/areas'

/**
 * The public shell: header, main, footer.
 *
 * Navigation uses plain anchors, not Inertia's <Link>. A client-side
 * navigation never re-renders the document head, so the title, canonical, and
 * JSON-LD would still describe the previous page. A real document request costs
 * milliseconds and keeps the head honest — and it keeps these pages free of a
 * router they have no other use for.
 *
 * The header carries one primary action, and it points at the booking flow.
 * WhatsApp appears once, in the footer, labelled for what it is now used for:
 * questions and complaints. A chat button sitting next to a booking button
 * sends most people down the channel that costs the most to staff.
 */

const NAV = [
  { href: '/layanan', label: 'Layanan' },
  { href: '/harga', label: 'Harga' },
  { href: '/area', label: 'Area Layanan' },
  { href: '/tentang', label: 'Tentang' },
]

/** The area links worth surfacing in the footer: the hubs, plus the campus page. */
const FOOTER_AREAS = AREAS.filter(
  (area) =>
    area.tier === 'hub' ||
    area.tier === 'campus' ||
    ['buahbatu', 'dago', 'kopo'].includes(area.slug)
)

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only bg-ink px-4 py-3 text-paper focus-visible:not-sr-only focus-visible:absolute focus-visible:top-2 focus-visible:left-2 focus-visible:z-50"
      >
        Lewati ke konten utama
      </a>

      <header className="border-b border-line">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4">
          <a href="/" aria-label="Umima.clean, ke beranda" className="mr-auto">
            {/*
              Served at the size it is drawn. The full-resolution wordmark is
              1600px wide and 101 KB — fine for the JSON-LD `image`, which no
              browser fetches, but absurd for a 92x32 header logo.
            */}
            <picture>
              <source srcSet="/images/logo-wordmark.webp" type="image/webp" />
              <img
                src="/images/logo-wordmark.jpg"
                alt="Logo Umima.clean"
                width={92}
                height={32}
                className="h-8 w-auto"
                fetchPriority="high"
              />
            </picture>
          </a>

          <nav aria-label="Navigasi utama" className="order-3 w-full sm:order-none sm:w-auto">
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              {NAV.map((item) => (
                <li key={item.href}>
                  <a className="text-ink-body hover:text-ink hover:underline" href={item.href}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <a
            className="bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink-body"
            href="/pesan"
          >
            Pesan Sekarang
          </a>
        </div>
      </header>

      <main id="main-content" tabIndex={-1}>
        {children}
      </main>

      <footer className="mt-20 border-t border-line bg-paper-tint">
        <div className="mx-auto grid max-w-5xl gap-8 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h2 className="text-sm font-semibold text-ink">Layanan</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {SERVICES.map((service) => (
                <li key={service.slug}>
                  <a className="text-ink-body hover:underline" href={service.path}>
                    {service.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-ink">Area</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {FOOTER_AREAS.map((area) => (
                <li key={area.slug}>
                  <a className="text-ink-body hover:underline" href={`/area/${area.slug}`}>
                    {area.name}
                  </a>
                </li>
              ))}
              <li>
                <a className="text-ink-body hover:underline" href="/area">
                  Semua area
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-ink">Informasi</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a className="text-ink-body hover:underline" href="/harga">
                  Harga
                </a>
              </li>
              <li>
                <a className="text-ink-body hover:underline" href="/faq">
                  FAQ
                </a>
              </li>
              <li>
                <a className="text-ink-body hover:underline" href="/tentang">
                  Tentang
                </a>
              </li>
              <li>
                <a className="text-ink-body hover:underline" href="/kontak">
                  Kontak
                </a>
              </li>
              <li>
                <a className="text-ink-body hover:underline" href="/pesan">
                  Pesan sekarang
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-ink">Kontak</h2>

            {/*
              The NAP block. These strings come from app/content/business.ts,
              the same module that feeds the JSON-LD, so the footer and the
              structured data can never drift apart.
            */}
            <address className="mt-3 text-sm not-italic text-ink-body">
              {SITE.addressLine}
              <br />
              <a className="hover:underline" href={`tel:${SITE.telephone}`}>
                {SITE.telephoneDisplay}
              </a>
              <br />
              {SITE.openingHoursLabel}
            </address>

            <p className="mt-3 text-sm text-ink-body">
              <a className="underline hover:no-underline" href={SITE.whatsapp}>
                WhatsApp
              </a>{' '}
              <span className="text-ink-muted">untuk pertanyaan &amp; komplen</span>
            </p>
            <p className="mt-2 text-sm">
              <a className="text-ink-body underline hover:no-underline" href={SITE.mapsUrl}>
                Lihat di Google Maps
              </a>
            </p>
          </div>
        </div>

        <div className="border-t border-line">
          <p className="mx-auto max-w-5xl px-5 py-5 text-xs text-ink-muted">
            © {new Date().getFullYear()} {SITE.name}. Antar jemput gratis se-Bandung.
          </p>
        </div>
      </footer>
    </>
  )
}

/**
 * Assigned to a page component's `layout` property. Inertia's resolver leaves
 * it alone when a page sets its own, so public pages opt out of the starter
 * kit's authenticated shell simply by exporting this.
 */
export const publicLayout = (page: ReactNode) => <PublicLayout>{page}</PublicLayout>
