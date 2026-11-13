import type { ReactNode } from 'react'
import FlashToasts from '~/components/molecules/flash_toasts'
import { OwnerSidebar, OwnerTopBar } from '~/components/organisms/owner_navigation'
import type { OwnerSection } from '~/lib/navigation/owner_links'

export default function OwnerLayout({
  active,
  title,
  children,
}: {
  active: OwnerSection
  title: string
  children: ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-background sm:flex-row">
      <OwnerSidebar active={active} />
      <OwnerTopBar active={active} title={title} />
      <main className="flex min-w-0 flex-1 flex-col gap-4 p-4 sm:px-7 sm:pt-6 sm:pb-7">
        {children}
      </main>
      <FlashToasts />
    </div>
  )
}
