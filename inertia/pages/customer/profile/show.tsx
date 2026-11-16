import type { ReactNode } from 'react'
import { Head } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { cn } from 'cn'
import { AccountIdentityCard, ActiveDevicesCard } from '~/components/organisms/account_security'
import CustomerLayout from '~/components/templates/customer_layout'
import { buttonVariants } from '~/components/ui/button'

export default function ProfileShow({ deviceCount }: { deviceCount: number }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-5 pt-8 sm:pt-10">
      <Head title="Profil" />
      <h1 className="text-3xl font-bold tracking-tight">Profil</h1>

      <AccountIdentityCard>
        <Link
          route="customer.profile.edit"
          className={cn(buttonVariants({ variant: 'outline', className: 'h-11 px-3 text-base' }))}
        >
          Ubah
        </Link>
      </AccountIdentityCard>

      <ActiveDevicesCard deviceCount={deviceCount} />
    </div>
  )
}

ProfileShow.layout = (page: ReactNode) => <CustomerLayout active="profil">{page}</CustomerLayout>
