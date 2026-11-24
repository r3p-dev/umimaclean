import type { ReactNode } from 'react'
import { Head } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { IconChevronRight, IconMapPin } from '@tabler/icons-react'
import {
  AccountCard,
  AccountIdentityCard,
  ActiveDevicesCard,
} from '~/components/organisms/account_security'
import { EditProfileLink } from '~/components/organisms/profile_forms'
import CustomerLayout from '~/components/templates/customer_layout'
import { Card, CardContent } from '~/components/ui/card'

export default function ProfileShow({ deviceCount }: { deviceCount: number }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-5 pt-8 sm:pt-10">
      <Head title="Profil" />
      <h1 className="text-3xl font-bold tracking-tight">Profil</h1>

      <AccountIdentityCard>
        <EditProfileLink area="customer" />
      </AccountIdentityCard>

      <Card>
        <CardContent>
          <Link
            route="customer.addresses.index"
            className="flex min-h-11 items-center gap-3 rounded-md text-base font-medium hover:text-primary"
          >
            <IconMapPin aria-hidden="true" className="size-5 text-primary" />
            <span className="flex flex-1 flex-col">
              Alamat
              <span className="text-sm font-normal text-muted-foreground">
                Alamat jemput dan antar, maksimal 3.
              </span>
            </span>
            <IconChevronRight aria-hidden="true" className="size-5 text-muted-foreground" />
          </Link>
        </CardContent>
      </Card>

      <ActiveDevicesCard deviceCount={deviceCount} />
      <AccountCard />
    </div>
  )
}

ProfileShow.layout = (page: ReactNode) => <CustomerLayout active="profil">{page}</CustomerLayout>
