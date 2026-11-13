import type { ReactNode } from 'react'
import FlashToasts from '~/components/molecules/flash_toasts'
import { StaffSidebar, StaffTabBar } from '~/components/organisms/staff_navigation'
import type { StaffSection } from '~/lib/navigation/staff_links'

export default function StaffLayout({
  active,
  children,
}: {
  active: StaffSection
  children: ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-background sm:flex-row">
      <StaffSidebar active={active} />
      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
      <StaffTabBar active={active} />
      <FlashToasts />
    </div>
  )
}
