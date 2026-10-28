import { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import { IconMapPin, IconMapPinPlus, IconPencil } from '@tabler/icons-react'
import { urlFor } from '~/client'
import BackLink from '~/components/molecules/back_link'
import EmptyState from '~/components/molecules/empty_state'
import ProfileShell from '~/components/organisms/profile/profile_shell'
import AccountLayout from '~/components/templates/account_layout'
import { Button, LinkButton } from '~/components/ui/button'
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
          <section className="mt-4 rounded-lg border border-border bg-card p-6">
            <EmptyState
              icon={IconMapPin}
              title="Belum ada alamat"
              description="Simpan alamat jemput sekali, dipakai otomatis setiap pesan."
            />
          </section>
        ) : (
          <ul className="mt-4 grid items-start gap-3 sm:grid-cols-2 sm:gap-4">
            {addresses.map((address) => (
              <li
                key={address.id}
                className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4"
              >
                <div className="flex items-start gap-3">
                  <IconMapPin className="mt-px size-5.5 shrink-0 text-primary" />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="flex items-center gap-2 text-[15px] leading-[1.2] font-semibold">
                      {address.label}
                      {address.isPrimary && (
                        <span className="rounded-pill bg-accent px-2 py-1 text-xs leading-none font-semibold text-accent-foreground">
                          Utama
                        </span>
                      )}
                    </span>
                    <span className="text-sm leading-[1.4] text-foreground-secondary">
                      {address.addressText}
                    </span>
                    {address.landmark && (
                      <span className="text-meta leading-[1.4] text-muted-foreground">
                        Patokan: {address.landmark}
                      </span>
                    )}
                    <span className="text-meta leading-[1.4] text-muted-foreground">
                      Penerima: {address.recipientName} · {displayPhone(address.recipientPhone)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 border-t border-border pt-3">
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
                </div>
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
