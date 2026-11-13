import type { ReactNode } from 'react'
import FlashToasts from '~/components/molecules/flash_toasts'
import { CustomerHeader, CustomerTabBar } from '~/components/organisms/customer_navigation'
import type { CustomerSection } from '~/lib/navigation/customer_links'

export default function CustomerLayout({
  active,
  children,
}: {
  active: CustomerSection
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <CustomerHeader active={active} />
      {/* The bottom padding keeps the last content above the phone tab bar. */}
      <main className="flex-1 pb-24 sm:pb-12">{children}</main>
      <CustomerTabBar active={active} />
      <FlashToasts />
    </div>
  )
}
