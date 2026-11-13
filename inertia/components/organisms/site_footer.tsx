import type { ComponentType, ReactNode, SVGProps } from 'react'
import { Link } from '@adonisjs/inertia/react'
import { IconBrandInstagram, IconBrandWhatsapp, IconClock, IconMapPin } from '@tabler/icons-react'
import Logo from '~/components/atoms/logo'
import { STORE_CONTACT } from '~/lib/store/contact'

const LINK =
  'inline-flex min-h-11 items-center text-foreground/80 hover:text-foreground hover:underline'

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
                href={STORE_CONTACT.mapsUrl}
              >
                {STORE_CONTACT.address}
              </ContactLine>
              <ContactLine icon={IconClock} label="Jam buka">
                {STORE_CONTACT.hours}
              </ContactLine>
              <ContactLine
                icon={IconBrandWhatsapp}
                label="WhatsApp"
                href={STORE_CONTACT.whatsappUrl}
              >
                {STORE_CONTACT.whatsapp}
              </ContactLine>
              <ContactLine
                icon={IconBrandInstagram}
                label="Instagram"
                href={STORE_CONTACT.instagramUrl}
              >
                {STORE_CONTACT.instagram}
              </ContactLine>
            </ul>
          </div>
          <FooterColumn id="footer-layanan" title="Layanan">
            <li>
              <a href="/#cara-kerja" className={LINK}>
                Cara Kerja
              </a>
            </li>
            <li>
              <a href="/#harga" className={LINK}>
                Daftar Harga
              </a>
            </li>
            <li>
              <a href="/#area-layanan" className={LINK}>
                Area Layanan
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
              <Link route="session.create" className={LINK}>
                Masuk
              </Link>
            </li>
            <li>
              <Link route="register.create" className={LINK}>
                Daftar Akun
              </Link>
            </li>
          </FooterColumn>
          <FooterColumn id="footer-tim" title="Tim Umima">
            <li>
              <span
                aria-disabled="true"
                className="inline-flex min-h-11 items-center text-foreground/80"
              >
                Masuk Staf & Owner
              </span>
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
