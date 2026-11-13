import type { ReactNode } from 'react'
import { Link } from '@adonisjs/inertia/react'
import Logo from '~/components/atoms/logo'
import FlashToasts from '~/components/molecules/flash_toasts'
import AuthBrandPanel from '~/components/organisms/auth_brand_panel'

export default function AuthLayout({
  isStaff = false,
  children,
}: {
  isStaff?: boolean
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-card lg:grid lg:grid-cols-2">
      <AuthBrandPanel isStaff={isStaff} />
      <main className="flex flex-col px-5 pt-5 pb-10 lg:justify-center lg:px-10 lg:py-12">
        <div className="mx-auto flex w-full max-w-md flex-col">
          <Link route="home" className="mb-5 self-start rounded-sm lg:hidden">
            <Logo />
          </Link>
          {children}
        </div>
      </main>
      <FlashToasts />
    </div>
  )
}
