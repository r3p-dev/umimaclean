import type { ReactNode } from 'react'
import { Head } from '@inertiajs/react'
import { AccountCard, AccountIdentityCard } from '~/components/organisms/account_security'
import OwnerPageHeader from '~/components/organisms/owner_page_header'
import { EditProfileLink } from '~/components/organisms/profile_forms'
import OwnerLayout from '~/components/templates/owner_layout'

// The same Profil cards as customers and staff (D108).
export default function OwnerProfile() {
  return (
    <>
      <Head title="Profil" />
      <OwnerPageHeader title="Profil" />
      <div className="flex max-w-2xl flex-col gap-4">
        <AccountIdentityCard>
          <EditProfileLink area="admin" />
        </AccountIdentityCard>
        <AccountCard />
      </div>
    </>
  )
}

OwnerProfile.layout = (page: ReactNode) => (
  <OwnerLayout active="profil" title="Profil">
    {page}
  </OwnerLayout>
)
