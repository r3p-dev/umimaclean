import type { ReactNode } from 'react'
import { Head } from '@inertiajs/react'
import {
  AccountCard,
  AccountIdentityCard,
  ActiveDevicesCard,
  PasswordForm,
} from '~/components/organisms/account_security'
import StaffTopBar from '~/components/organisms/staff_top_bar'
import StaffLayout from '~/components/templates/staff_layout'

export default function StaffProfile({ deviceCount }: { deviceCount: number }) {
  return (
    <>
      <Head title="Profil" />
      <StaffTopBar title="Profil" />
      <div className="mx-auto grid w-full max-w-4xl items-start gap-4 px-5 py-6 lg:grid-cols-2">
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

StaffProfile.layout = (page: ReactNode) => <StaffLayout active="profil">{page}</StaffLayout>
