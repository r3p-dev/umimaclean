import type { ReactNode } from 'react'
import { Head } from '@inertiajs/react'
import { PasswordForm } from '~/components/organisms/account_security'
import OwnerPageHeader from '~/components/organisms/owner_page_header'
import { BackLink, ProfileDetailsCard } from '~/components/organisms/profile_forms'
import OwnerLayout from '~/components/templates/owner_layout'

export default function OwnerProfileEdit() {
  return (
    <>
      <Head title="Ubah Profil" />
      <OwnerPageHeader title="Ubah profil" />
      <div className="flex max-w-2xl flex-col gap-4">
        <BackLink area="admin" to="show" />
        <ProfileDetailsCard area="admin" />
        <PasswordForm />
      </div>
    </>
  )
}

OwnerProfileEdit.layout = (page: ReactNode) => (
  <OwnerLayout active="profil" title="Ubah profil">
    {page}
  </OwnerLayout>
)
