import type { ReactNode } from 'react'
import { Head, usePage } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import {
  IconBrandWhatsapp,
  IconChevronRight,
  IconFileText,
  IconLock,
  IconMapPin,
} from '@tabler/icons-react'
import { AccountCard } from '~/components/organisms/account_security'
import { EditProfileLink } from '~/components/organisms/profile_forms'
import CustomerLayout from '~/components/templates/customer_layout'
import { formatPhone } from '~/lib/phone'

function addressSummary(count: number, primaryLabel: string | null) {
  if (count === 0) {
    return 'Belum ada alamat tersimpan.'
  }
  return primaryLabel ? `${count} alamat · Utama: ${primaryLabel}` : `${count} alamat tersimpan.`
}

const TILE =
  'flex min-h-16 w-full cursor-pointer items-center gap-3.5 border-b border-border px-4 py-3 text-left text-foreground transition-colors last:border-b-0 hover:bg-muted/60 active:bg-muted sm:min-h-0 sm:flex-col sm:items-start sm:gap-2 sm:rounded-xl sm:border sm:bg-card sm:p-5 sm:last:border-b'

export default function ProfileShow({
  addressCount,
  primaryLabel,
}: {
  addressCount: number
  primaryLabel: string | null
}) {
  const { user, store } = usePage().props

  return (
    <div className="mx-auto max-w-6xl px-5 pt-6 lg:pt-10">
      <Head title="Profil" />
      <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Profil</h1>

      <div className="mt-5 flex flex-col gap-4 lg:mt-6">
        <section className="flex flex-wrap items-center gap-4 sm:flex-nowrap sm:rounded-xl sm:border sm:border-border sm:bg-card sm:p-5">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-accent text-lg font-semibold text-accent-foreground">
            {user?.initials}
          </span>
          <span className="flex min-w-0 flex-1 basis-48 flex-col gap-1 sm:basis-0">
            <span data-slot="account-name" className="text-xl font-bold wrap-break-word">
              {user?.fullName}
            </span>
            <span className="text-sm text-muted-foreground">{formatPhone(user?.phone ?? '')}</span>
          </span>
          <div className="ml-18 sm:ml-0">
            <EditProfileLink area="customer" />
          </div>
        </section>

        <div className="overflow-hidden rounded-xl border border-border bg-card sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:border-0 sm:bg-transparent">
          <Link route="customer.addresses.index" className={TILE}>
            <IconMapPin
              aria-hidden="true"
              className="size-5 shrink-0 text-muted-foreground sm:text-primary"
            />
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-base font-semibold">Atur alamat</span>
              <span className="text-sm text-muted-foreground">
                {addressSummary(addressCount, primaryLabel)}
              </span>
            </span>
            <IconChevronRight
              aria-hidden="true"
              className="size-5 text-muted-foreground sm:hidden"
            />
          </Link>

          <Link route="customer.profile.edit" className={TILE}>
            <IconLock
              aria-hidden="true"
              className="size-5 shrink-0 text-muted-foreground sm:text-primary"
            />
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-base font-semibold">Kata sandi &amp; nomor</span>
              <span className="text-sm text-muted-foreground">
                Kelola nama, nomor WhatsApp, dan kata sandi.
              </span>
            </span>
            <IconChevronRight
              aria-hidden="true"
              className="size-5 text-muted-foreground sm:hidden"
            />
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card lg:hidden">
          <a
            href={`https://wa.me/${store.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className={TILE}
          >
            <IconBrandWhatsapp
              aria-hidden="true"
              className="size-5 shrink-0 text-muted-foreground"
            />
            <span className="flex-1 text-base font-medium">Bantuan via WhatsApp</span>
            <IconChevronRight aria-hidden="true" className="size-5 text-muted-foreground" />
          </a>
          <Link route="legal.terms" className={TILE}>
            <IconFileText aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
            <span className="flex-1 text-base font-medium">Syarat layanan &amp; privasi</span>
            <IconChevronRight aria-hidden="true" className="size-5 text-muted-foreground" />
          </Link>
        </div>

        <AccountCard />
      </div>
    </div>
  )
}

ProfileShow.layout = (page: ReactNode) => <CustomerLayout active="profil">{page}</CustomerLayout>
