import type { ComponentType, ReactNode, SVGProps } from 'react'
import { Link } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'
import { IconBrandInstagram, IconBrandWhatsapp, IconClock, IconMapPin } from '@tabler/icons-react'
import Logo from '~/components/atoms/logo'

const LINK =
  'inline-flex min-h-11 items-center text-foreground/80 hover:text-foreground hover:underline'

const SOCIAL_LINKS = {
  mapsUrl: 'https://maps.app.goo.gl/uRvrkrqYF3Eu8UXS6',
  instagram: '@umima.clean',
  instagramUrl: 'https://www.instagram.com/umima.clean',
}

function formatPhoneDisplay(e164: string): string {
  const local = e164.startsWith('62') ? '0' + e164.slice(2) : e164
  return local.replace(/(\d{4})(\d{4})(\d+)/, '$1-$2-$3')
}

function FooterColumn({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <nav aria-labelledby={id} className="flex flex-col gap-1">
      <h2 id={id} className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
        {title}
      </h2>
      <ul className="flex flex-col text-sm font-medium">{children}</ul>
    </nav>
  )
}

function ContactLine({
  icon: Icon,
  label,
  href,
  children,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  label: string
  href?: string
  children: ReactNode
}) {
  const content = (
    <>
      <Icon className="size-4.5 shrink-0 text-muted-foreground" />
      <span className="sr-only">{label}: </span>
      {children}
    </>
  )

  return (
    <li>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center gap-2 hover:text-foreground hover:underline"
        >
          {content}
        </a>
      ) : (
        <span className="inline-flex min-h-11 items-center gap-2">{content}</span>
      )}
    </li>
  )
}

export default function SiteFooter({ children }: { children?: ReactNode }) {
  const { store } = usePage().props
  const storeInfo = store ?? {
    name: 'Umima Clean',
    whatsapp: '6285157900974',
    address: 'Jl. Margacinta No. 132, Margasari, Buahbatu, Kota Bandung 40286',
    hours: '09.00–20.00',
  }

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 pt-10 pb-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-10">
          <div className="col-span-2 flex flex-col items-start gap-4 sm:col-span-3 lg:col-span-2">
            <Link route="home" className="rounded-sm">
              <Logo />
            </Link>
            <p className="max-w-80 text-sm text-pretty text-foreground/80">
              Cuci sepatu dan tas dengan antar-jemput di Bandung Raya. Helm dicuci langsung di toko.
            </p>
            <ul className="flex flex-col text-sm text-foreground/80">
              <ContactLine
                icon={IconMapPin}
                label="Alamat di Google Maps"
                href={SOCIAL_LINKS.mapsUrl}
              >
                {storeInfo.address}
              </ContactLine>
              <ContactLine icon={IconClock} label="Jam buka">
                {storeInfo.hours}
              </ContactLine>
              <ContactLine
                icon={IconBrandWhatsapp}
                label="WhatsApp"
                href={`https://wa.me/${storeInfo.whatsapp}`}
              >
                {formatPhoneDisplay(storeInfo.whatsapp)}
              </ContactLine>
              <ContactLine
                icon={IconBrandInstagram}
                label="Instagram"
                href={SOCIAL_LINKS.instagramUrl}
              >
                {SOCIAL_LINKS.instagram}
              </ContactLine>
            </ul>
          </div>
          <FooterColumn id="footer-layanan" title="Layanan">
            <li>
              <a href="/#harga" className={LINK}>
                Layanan & Harga
              </a>
            </li>
            <li>
              <a href="/#cara-kerja" className={LINK}>
                Cara Kerja
              </a>
            </li>
            <li>
              <a href="/#ulasan" className={LINK}>
                Ulasan
              </a>
            </li>
            <li>
              <a href="/#faq" className={LINK}>
                Pertanyaan Umum
              </a>
            </li>
          </FooterColumn>
          <FooterColumn id="footer-pelanggan" title="Pelanggan">
            <li>
              <Link route="register.create" className={LINK}>
                Daftar Akun
              </Link>
            </li>
            <li>
              <Link route="session.create" className={LINK}>
                Masuk
              </Link>
            </li>
            <li>
              <Link route="legal.terms" className={LINK}>
                Syarat Layanan
              </Link>
            </li>
            <li>
              <Link route="legal.privacy" className={LINK}>
                Kebijakan Privasi
              </Link>
            </li>
          </FooterColumn>
          <FooterColumn id="footer-tim" title="Tim Umima">
            <li>
              <Link route="session.createStaff" className={LINK}>
                Masuk Staf & Owner
              </Link>
            </li>
          </FooterColumn>
        </div>
        {children}
        <div className="flex flex-col gap-1 border-t border-border py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Umima Clean · Bandung Raya</p>
        </div>
      </div>
    </footer>
  )
}
