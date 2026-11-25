import type { ReactNode } from 'react'
import { Head } from '@inertiajs/react'
import { BackLink, PhoneChangeCard } from '~/components/organisms/profile_forms'
import CustomerLayout from '~/components/templates/customer_layout'

export default function ProfilePhone() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 pt-6 lg:pt-10">
      <Head title="Ganti Nomor WhatsApp" />
      <BackLink area="customer" to="edit" />
      <h1 className="text-3xl font-bold tracking-tight">Ganti nomor WhatsApp</h1>
      <PhoneChangeCard area="customer" />
    </div>
  )
}

ProfilePhone.layout = (page: ReactNode) => <CustomerLayout active="profil">{page}</CustomerLayout>
