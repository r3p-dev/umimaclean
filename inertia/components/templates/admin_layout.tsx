import { type ReactNode } from 'react'
import { AdminSidebar, AdminTopBar } from '~/components/organisms/admin_nav'
import FlashToasts from '~/components/organisms/flash_toasts'
import type { AdminSection } from '~/lib/navigation/admin_links'

export default function AdminLayout({
  active,
  title,
  children,
}: {
  active: AdminSection
  title: string
  children: ReactNode
}) {
  return (
    <div className="min-h-dvh bg-background sm:grid sm:grid-cols-[72px_minmax(0,1fr)] lg:grid-cols-[232px_minmax(0,1fr)]">
      <AdminSidebar active={active} />
      <AdminTopBar active={active} title={title} />
      <main className="flex min-w-0 flex-col gap-4.5 p-4 sm:px-7 sm:pt-6 sm:pb-7">{children}</main>
      <FlashToasts />
    </div>
  )
}
