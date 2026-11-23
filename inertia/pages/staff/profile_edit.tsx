import type { ReactNode } from 'react'
import { Head } from '@inertiajs/react'
import { PasswordForm } from '~/components/organisms/account_security'
import { BackLink, ProfileDetailsCard } from '~/components/organisms/profile_forms'
import StaffTopBar from '~/components/organisms/staff_top_bar'
import StaffLayout from '~/components/templates/staff_layout'

export default function StaffProfileEdit() {
  return (
    <>
      <Head title="Ubah Profil" />
      <StaffTopBar title="Ubah profil" />
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-5 py-6">
        <BackLink area="staff" to="show" />
        <ProfileDetailsCard area="staff" />
        <PasswordForm />
      </div>
    </>
  )
}

StaffProfileEdit.layout = (page: ReactNode) => <StaffLayout active="profil">{page}</StaffLayout>
