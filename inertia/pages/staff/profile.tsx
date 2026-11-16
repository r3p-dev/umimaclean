import type { ReactNode } from 'react'
import { Head } from '@inertiajs/react'
import { Form } from '@adonisjs/inertia/react'
import { IconLogout } from '@tabler/icons-react'
import CsrfField from '~/components/atoms/csrf_field'
import {
  AccountIdentityCard,
  ActiveDevicesCard,
  PasswordForm,
} from '~/components/organisms/account_security'
import StaffTopBar from '~/components/organisms/staff_top_bar'
import StaffLayout from '~/components/templates/staff_layout'
import { Button } from '~/components/ui/button'

export default function StaffProfile({ deviceCount }: { deviceCount: number }) {
  return (
    <>
      <Head title="Profil" />
      <StaffTopBar title="Profil" />
      <div className="mx-auto grid w-full max-w-4xl items-start gap-4 px-5 py-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <AccountIdentityCard />
          {/* Phones have no sidebar, so signing out lives here too. */}
          <ActiveDevicesCard deviceCount={deviceCount}>
            <Form route="session.destroy">
              <CsrfField />
              <Button type="submit" variant="destructive" className="h-11 w-full gap-2 text-base">
                <IconLogout className="size-5" />
                Keluar
              </Button>
            </Form>
          </ActiveDevicesCard>
        </div>
        <PasswordForm />
      </div>
    </>
  )
}

StaffProfile.layout = (page: ReactNode) => <StaffLayout active="profil">{page}</StaffLayout>
