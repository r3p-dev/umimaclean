import { Link } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'
import { urlFor } from '~/client'
import { IconLogin, IconUserCircle } from '@tabler/icons-react'
import Logo from '~/components/atoms/logo'
import { LinkButton } from '~/components/ui/button'

export default function SiteHeader() {
  const account = usePage().props.account
  const isStaff = account ? account.role !== 'customer' : false

  return (
    <header className="border-b border-border">
      <div className="mx-auto box-content flex h-16 max-w-page items-center gap-1.5 px-5">
        <div className="flex flex-1 items-center">
          <Link route="home" className="rounded-xs">
            <Logo />
          </Link>
        </div>
        <nav aria-label="Navigasi utama" className="-mr-2 flex items-center gap-1.5">
          <LinkButton
            variant="ghost"
            size="desktop"
            className="hidden px-3 font-medium sm:inline-flex"
            href="/#cara-kerja"
          >
            Cara Kerja
          </LinkButton>
          <LinkButton
            variant="ghost"
            size="desktop"
            className="hidden px-3 font-medium sm:inline-flex"
            href="/#area-layanan"
          >
            Area Layanan
          </LinkButton>
          <LinkButton
            variant="ghost"
            size="desktop"
            className="hidden px-3 font-medium sm:inline-flex"
            href="/#harga"
          >
            Harga
          </LinkButton>
          <LinkButton
            variant="ghost"
            size="desktop"
            className="gap-1.5 px-3"
            href={account ? urlFor(isStaff ? 'staff.home' : 'customer.home') : urlFor('auth.login')}
          >
            {account ? <IconUserCircle /> : <IconLogin />}
            {account ? (isStaff ? 'Aplikasi Staf' : 'Akun Saya') : 'Masuk'}
          </LinkButton>
          <LinkButton
            size="desktop"
            className="ml-1 hidden px-4 lg:inline-flex"
            href={urlFor('customer.order.create')}
          >
            Pesan Penjemputan
          </LinkButton>
        </nav>
      </div>
    </header>
  )
}
