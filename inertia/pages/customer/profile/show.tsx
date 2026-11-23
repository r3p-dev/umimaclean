import type { ReactNode } from 'react'
import { Head } from '@inertiajs/react'
import {
  AccountCard,
  AccountIdentityCard,
  ActiveDevicesCard,
} from '~/components/organisms/account_security'
import { EditProfileLink } from '~/components/organisms/profile_forms'
import CustomerLayout from '~/components/templates/customer_layout'

export default function ProfileShow({ deviceCount }: { deviceCount: number }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-5 pt-8 sm:pt-10">
      <Head title="Profil" />
      <h1 className="text-3xl font-bold tracking-tight">Profil</h1>

      <AccountIdentityCard>
        <EditProfileLink area="customer" />
      </AccountIdentityCard>

      <ActiveDevicesCard deviceCount={deviceCount} />
      <AccountCard />
    </div>
  )
}

ProfileShow.layout = (page: ReactNode) => <CustomerLayout active="profil">{page}</CustomerLayout>
