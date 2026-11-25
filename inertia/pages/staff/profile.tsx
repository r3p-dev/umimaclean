import type { ReactNode } from 'react'
import { Head } from '@inertiajs/react'
import { AccountCard, AccountIdentityCard } from '~/components/organisms/account_security'
import { EditProfileLink } from '~/components/organisms/profile_forms'
import StaffTopBar from '~/components/organisms/staff_top_bar'
import StaffLayout from '~/components/templates/staff_layout'

// The same Profil cards as customers and the owner (D108).
export default function StaffProfile() {
  return (
    <>
      <Head title="Profil" />
      <StaffTopBar title="Profil" />
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-5 py-6">
        <AccountIdentityCard>
          <EditProfileLink area="staff" />
        </AccountIdentityCard>
        <AccountCard />
      </div>
    </>
  )
}

StaffProfile.layout = (page: ReactNode) => <StaffLayout active="profil">{page}</StaffLayout>
