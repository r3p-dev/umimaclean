import type { ReactNode } from 'react'
import FlashToasts from '~/components/molecules/flash_toasts'
import FlowHeader from '~/components/organisms/flow_header'

export default function FlowLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-card">
      <FlowHeader title={title} />
      <main className="flex-1">{children}</main>
      <FlashToasts />
    </div>
  )
}
