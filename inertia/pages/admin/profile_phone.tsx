import type { ReactNode } from 'react'
import { Head } from '@inertiajs/react'
import OwnerPageHeader from '~/components/organisms/owner_page_header'
import { BackLink, PhoneChangeCard } from '~/components/organisms/profile_forms'
import OwnerLayout from '~/components/templates/owner_layout'

export default function OwnerProfilePhone() {
  return (
    <>
      <Head title="Ganti Nomor WhatsApp" />
      <OwnerPageHeader title="Ganti nomor WhatsApp" />
      <div className="flex max-w-2xl flex-col gap-4">
        <BackLink area="admin" to="edit" />
        <PhoneChangeCard area="admin" />
      </div>
    </>
  )
}

OwnerProfilePhone.layout = (page: ReactNode) => (
  <OwnerLayout active="profil" title="Ganti nomor WhatsApp">
    {page}
  </OwnerLayout>
)
