import { cn } from 'cn'
import { Link } from '@adonisjs/inertia/react'
import { IconLogin } from '@tabler/icons-react'
import Logo from '~/components/atoms/logo'
import { buttonVariants } from '~/components/ui/button'

// The price list and service area sections join the landing in M3, with their links.
const SECTION_LINKS = [
  { href: '/#cara-kerja', label: 'Cara Kerja' },
  { href: '/#ulasan', label: 'Ulasan' },
  { href: '/#faq', label: 'Pertanyaan Umum' },
]

export default function SiteHeader() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-1.5 px-5">
        <div className="flex flex-1 items-center">
          <Link route="home" className="rounded-sm">
            <Logo />
          </Link>
        </div>
        <nav aria-label="Navigasi utama" className="-mr-2 flex items-center gap-1.5">
          {SECTION_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                buttonVariants({
                  variant: 'ghost',
                  className: 'hidden h-11 px-3 text-sm sm:inline-flex',
                })
              )}
            >
              {link.label}
            </a>
          ))}
          <Link
            route="session.create"
            className={cn(
              buttonVariants({ variant: 'ghost', className: 'h-11 gap-1.5 px-3 text-sm' })
            )}
          >
            <IconLogin className="size-5" />
            Masuk
          </Link>
          {/* Ordering needs an account, so until the order page exists (M5) this opens sign-in. */}
          <Link
            route="session.create"
            className={cn(
              buttonVariants({
                className: 'ml-1 hidden h-11 px-4 text-sm lg:inline-flex',
              })
            )}
          >
            Pesan Penjemputan
          </Link>
        </nav>
      </div>
    </header>
  )
}
