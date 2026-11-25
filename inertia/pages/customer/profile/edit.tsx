import type { ReactNode } from 'react'
import { Head } from '@inertiajs/react'
import { PasswordForm } from '~/components/organisms/account_security'
import { BackLink, ProfileDetailsCard } from '~/components/organisms/profile_forms'
import CustomerLayout from '~/components/templates/customer_layout'

export default function ProfileEdit() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 pt-4 sm:pt-10">
      <Head title="Ubah Profil" />
      <BackLink area="customer" to="show" />
      <h1 className="text-3xl font-bold tracking-tight">Ubah profil</h1>
      <ProfileDetailsCard area="customer" />
      <PasswordForm />
    </div>
  )
}

ProfileEdit.layout = (page: ReactNode) => <CustomerLayout active="profil">{page}</CustomerLayout>
