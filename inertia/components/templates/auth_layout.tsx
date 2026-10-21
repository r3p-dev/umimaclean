import { type ReactNode } from 'react'
import { Link } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'
import Logo from '~/components/atoms/logo'
import AuthBrandPanel from '~/components/organisms/auth_brand_panel'
import FlashToasts from '~/components/organisms/flash_toasts'

export default function AuthLayout({ children }: { children: ReactNode }) {
  const isStaff = usePage().component === 'auth/staff_login'

  return (
    <div className="min-h-screen bg-card lg:grid lg:grid-cols-2">
      <AuthBrandPanel isStaff={isStaff} />
      <main className="flex flex-col px-5 pt-5 pb-10 lg:justify-center lg:px-10 lg:py-12">
        <div className="mx-auto flex w-full max-w-105 flex-col">
          <Link route="home" className="mb-5 self-start rounded-xs lg:hidden">
            <Logo />
          </Link>
          {children}
        </div>
      </main>
      <FlashToasts />
    </div>
  )
}
