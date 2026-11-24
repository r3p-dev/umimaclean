import { useState, type ReactNode } from 'react'
import { Head, router } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { IconAlertTriangle, IconMapPin, IconMapPinPlus, IconPencil } from '@tabler/icons-react'
import { cn } from 'cn'
import type { Data } from '@generated/data'
import { urlFor } from '~/client'
import Note from '~/components/atoms/note'
import { BackLink } from '~/components/organisms/profile_forms'
import CustomerLayout from '~/components/templates/customer_layout'
import { Badge } from '~/components/ui/badge'
import { Button, buttonVariants } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { formatPhone } from '~/lib/phone'

// CUST-14: the saved addresses, primary first; at most `maxAddresses` (CUST-2).
export default function AddressIndex({
  addresses,
  maxAddresses,
}: {
  addresses: Data.Address[]
  maxAddresses: number
}) {
  const [pendingId, setPendingId] = useState<number | null>(null)
  const isFull = addresses.length >= maxAddresses

  function makePrimary(address: Data.Address) {
    router.post(
      urlFor('customer.addresses.primary', { id: address.id }),
      {},
      {
        preserveScroll: true,
        onStart: () => setPendingId(address.id),
        onFinish: () => setPendingId(null),
      }
    )
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 px-5 pt-4 pb-8 sm:pt-10">
      <Head title="Alamat" />
      <BackLink area="customer" to="show" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Alamat</h1>
          <p className="text-base text-muted-foreground">
            Alamat utama otomatis dipilih saat Anda memesan.
            {isFull && ` Maksimal ${maxAddresses} alamat tersimpan.`}
          </p>
        </div>
        {!isFull && (
          <Link
            route="customer.addresses.create"
            className={cn(buttonVariants({ className: 'h-11 gap-2 px-4 max-sm:w-full' }))}
          >
            <IconMapPinPlus aria-hidden="true" className="size-5" />
            Tambah alamat
          </Link>
        )}
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
            <IconMapPin aria-hidden="true" className="size-8 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Belum ada alamat</h2>
            <p className="text-base text-muted-foreground">
              Simpan alamat jemput sekali, dipakai otomatis setiap pesan.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul className="grid items-start gap-3 sm:grid-cols-2 sm:gap-4">
          {addresses.map((address) => (
            <li key={address.id}>
              <Card>
                <CardHeader>
                  <CardTitle>
                    <h2 className="flex flex-wrap items-center gap-2">
                      <IconMapPin aria-hidden="true" className="size-5 text-primary" />
                      {address.label}
                      {address.isPrimary && <Badge>Utama</Badge>}
                    </h2>
                  </CardTitle>
                  <CardDescription className="flex flex-col gap-1 text-sm">
                    <span className="text-foreground">{address.addressText}</span>
                    {address.landmark && <span>Patokan: {address.landmark}</span>}
                    <span>
                      Penerima: {address.recipientName} · {formatPhone(address.recipientPhone)}
                    </span>
                  </CardDescription>
                </CardHeader>
                {address.isCovered === false && (
                  <CardContent>
                    {/* D82: the district was turned off after saving; ordering refuses it (M5a). */}
                    <Note
                      tone="danger"
                      icon={
                        <IconAlertTriangle aria-hidden="true" className="mt-px size-4.5 shrink-0" />
                      }
                    >
                      Di luar area layanan
                    </Note>
                  </CardContent>
                )}
                <CardFooter className="gap-2 border-t">
                  <Link
                    route="customer.addresses.edit"
                    routeParams={{ id: address.id }}
                    aria-label={`Ubah ${address.label}`}
                    className={cn(
                      buttonVariants({ variant: 'outline', className: 'h-11 flex-1 gap-1.5' })
                    )}
                  >
                    <IconPencil aria-hidden="true" className="size-4.5" />
                    Ubah
                  </Link>
                  {!address.isPrimary && (
                    <Button
                      variant="outline"
                      className="h-11 flex-1"
                      isDisabled={pendingId === address.id}
                      onPress={() => makePrimary(address)}
                      aria-label={`Jadikan utama: ${address.label}`}
                    >
                      Jadikan utama
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

AddressIndex.layout = (page: ReactNode) => <CustomerLayout active="profil">{page}</CustomerLayout>
