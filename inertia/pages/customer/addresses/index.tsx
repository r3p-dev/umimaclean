import { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import { IconMapPin, IconMapPinPlus, IconPencil } from '@tabler/icons-react'
import { urlFor } from '~/client'
import BackLink from '~/components/molecules/back_link'
import EmptyState from '~/components/molecules/empty_state'
import ProfileShell from '~/components/organisms/profile/profile_shell'
import AccountLayout from '~/components/templates/account_layout'
import { Button, LinkButton } from '~/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import type { SavedAddress } from '~/lib/order/addresses'
import { displayPhone } from '~/lib/shared/phone'

export default function AddressIndex({
  addresses,
  max,
}: {
  addresses: SavedAddress[]
  max: number
}) {
  const [pending, setPending] = useState<number | null>(null)
  const isFull = addresses.length >= max

  function makePrimary(address: SavedAddress) {
    router.post(
      urlFor('customer.addresses.primary', { id: address.id }),
      {},
      {
        preserveScroll: true,
        onStart: () => setPending(address.id),
        onFinish: () => setPending(null),
      }
    )
  }

  const add = (
    <LinkButton
      href={urlFor('customer.addresses.create')}
      isDisabled={isFull}
      size="desktop"
      className="gap-2 px-4 max-sm:h-cta max-sm:w-full"
    >
      <IconMapPinPlus className="size-5" />
      Tambah alamat
    </LinkButton>
  )

  return (
    <>
      <Head title="Atur Alamat" />
      <ProfileShell
        active="alamat"
        title="Alamat"
        back={<BackLink href={urlFor('customer.profile.show')} label="Profil" />}
      >
        <div className="mt-1 flex items-end justify-between gap-4">
          <p className="text-[15px] leading-normal text-foreground-secondary">
            Alamat utama otomatis dipilih saat Anda memesan.
            {isFull && ` Maksimal ${max} alamat tersimpan.`}
          </p>
          <div className="max-sm:hidden">{add}</div>
        </div>
        {addresses.length === 0 ? (
          <div className="mt-4">
            <Card>
              <CardContent>
                <EmptyState
                  icon={IconMapPin}
                  title="Belum ada alamat"
                  description="Simpan alamat jemput sekali, dipakai otomatis setiap pesan."
                />
              </CardContent>
            </Card>
          </div>
        ) : (
          <ul className="mt-4 grid items-start gap-3 sm:grid-cols-2 sm:gap-4">
            {addresses.map((address) => (
              <li key={address.id}>
                <Card>
                  <CardHeader>
                    <CardTitle as="h2">
                      <span className="flex items-center gap-2">
                        <IconMapPin className="size-5 shrink-0 text-primary" />
                        {address.label}
                      </span>
                    </CardTitle>
                    {address.isPrimary && (
                      <CardAction>
                        <span className="rounded-pill bg-accent px-2 py-1 text-xs leading-none font-semibold text-accent-foreground">
                          Utama
                        </span>
                      </CardAction>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-1">
                      <p className="text-foreground-secondary">{address.addressText}</p>
                      {address.landmark && (
                        <p className="text-meta text-muted-foreground">
                          Patokan: {address.landmark}
                        </p>
                      )}
                      <p className="text-meta text-muted-foreground">
                        Penerima: {address.recipientName} · {displayPhone(address.recipientPhone)}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t">
                    <LinkButton
                      href={urlFor('customer.addresses.edit', { id: address.id })}
                      variant="outline"
                      size="compact"
                      aria-label={`Ubah ${address.label}`}
                      className="flex-1 gap-1.5"
                    >
                      <IconPencil className="size-4.5" />
                      Ubah
                    </LinkButton>
                    {!address.isPrimary && (
                      <Button
                        variant="outline"
                        size="compact"
                        className="flex-1"
                        isPending={pending === address.id}
                        onPress={() => makePrimary(address)}
                        aria-label={`Jadikan ${address.label} alamat utama`}
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
        <div className="mt-4 sm:hidden">{add}</div>
      </ProfileShell>
    </>
  )
}

AddressIndex.layout = [AccountLayout]
