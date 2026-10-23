import { type ReactNode } from 'react'
import { usePage } from '@inertiajs/react'
import { AccountHeader, AccountTabBar } from '~/components/organisms/account_nav'
import FlashToasts from '~/components/organisms/flash_toasts'
import CustomerLayout from '~/components/templates/customer_layout'
import { accountSectionOf } from '~/lib/navigation/account_links'

export default function AccountLayout({ children }: { children: ReactNode }) {
  const { url, props } = usePage()
  const section = accountSectionOf(url)
  const account = props.account

  if (account?.role !== 'customer') {
    return <CustomerLayout>{children}</CustomerLayout>
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AccountHeader
        active={section}
        name={account?.name ?? ''}
        firstName={account?.firstName ?? ''}
      />
      <main className="flex-1 pb-[calc(var(--spacing-tab-bar)+24px)] sm:pb-12">{children}</main>
      <AccountTabBar active={section} />
      <FlashToasts />
    </div>
  )
}
