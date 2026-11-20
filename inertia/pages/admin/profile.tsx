import type { ReactNode } from 'react'
import { Head } from '@inertiajs/react'
import {
  AccountCard,
  AccountIdentityCard,
  ActiveDevicesCard,
  PasswordForm,
} from '~/components/organisms/account_security'
import OwnerPageHeader from '~/components/organisms/owner_page_header'
import OwnerLayout from '~/components/templates/owner_layout'

export default function OwnerProfile({ deviceCount }: { deviceCount: number }) {
  return (
    <>
      <Head title="Profil" />
      <OwnerPageHeader title="Profil" />
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <AccountIdentityCard />
          <ActiveDevicesCard deviceCount={deviceCount} />
        </div>
        <PasswordForm />
        <div className="lg:col-span-2">
          <AccountCard />
        </div>
      </div>
    </>
  )
}

OwnerProfile.layout = (page: ReactNode) => (
  <OwnerLayout active="profil" title="Profil">
    {page}
  </OwnerLayout>
)
