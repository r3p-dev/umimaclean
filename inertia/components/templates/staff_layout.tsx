import { type ReactNode } from 'react'
import FlashToasts from '~/components/organisms/flash_toasts'
import { StaffSidebar, StaffTabBar } from '~/components/organisms/staff_nav'
import type { StaffSection } from '~/lib/navigation/staff_links'
import { staffCounts } from '~/lib/staff/summary'
import { useWorkday } from '~/lib/staff/workday'

export default function StaffLayout({
  active,
  children,
}: {
  active: StaffSection
  children: ReactNode
}) {
  const counts = staffCounts(useWorkday())

  return (
    <div className="flex min-h-dvh flex-col bg-background sm:grid sm:grid-cols-[72px_minmax(0,1fr)] lg:grid-cols-[232px_minmax(0,1fr)]">
      <StaffSidebar active={active} counts={counts} />
      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
      <StaffTabBar active={active} />
      <FlashToasts />
    </div>
  )
}
