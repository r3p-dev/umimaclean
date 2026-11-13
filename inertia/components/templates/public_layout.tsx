import type { ReactNode } from 'react'
import FlashToasts from '~/components/molecules/flash_toasts'
import SiteFooter from '~/components/organisms/site_footer'
import SiteHeader from '~/components/organisms/site_header'

export default function PublicLayout({
  footerNote,
  children,
}: {
  footerNote?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-card">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter>{footerNote}</SiteFooter>
      <FlashToasts />
    </div>
  )
}
