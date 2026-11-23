import type { ReactNode } from 'react'
import { Head } from '@inertiajs/react'
import { BackLink, PhoneChangeCard } from '~/components/organisms/profile_forms'
import StaffTopBar from '~/components/organisms/staff_top_bar'
import StaffLayout from '~/components/templates/staff_layout'

export default function StaffProfilePhone() {
  return (
    <>
      <Head title="Ganti Nomor WhatsApp" />
      <StaffTopBar title="Ganti nomor WhatsApp" />
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-5 py-6">
        <BackLink area="staff" to="edit" />
        <PhoneChangeCard area="staff" />
      </div>
    </>
  )
}

StaffProfilePhone.layout = (page: ReactNode) => <StaffLayout active="profil">{page}</StaffLayout>
