import { Link } from '@adonisjs/inertia/react'
import { IconMapPinPlus } from '@tabler/icons-react'
import type { Data } from '@generated/data'
import { cn } from 'cn'
import { Badge } from '~/components/ui/badge'
import { Button, buttonVariants } from '~/components/ui/button'
import { Dialog, DialogTitle } from '~/components/ui/dialog'

function AddressDetails({ address }: { address: Data.Address }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-base font-semibold">{address.label}</span>
        {address.isPrimary && <Badge variant="secondary">Utama</Badge>}
        {address.isCovered === false && <Badge variant="destructive">Di luar area layanan</Badge>}
      </div>
      <p className="text-sm text-foreground">
        {address.recipientName} · {address.recipientPhone}
      </p>
      <p className="text-sm text-muted-foreground">
        {address.addressText}
        {address.details ? `, ${address.details}` : ''}
      </p>
      <p className="text-xs text-muted-foreground">
        Kec. {address.kecamatan}, {address.city}
      </p>
    </div>
  )
}

// Shopee-style compact address card + responsive picker (full-screen sheet on mobile, dialog on desktop).
export default function AddressPicker({
  title,
  changeLabel,
  addresses,
  selectedId,
  onSelect,
  isOpen,
  onOpenChange,
  canAddAddress,
  addAddressHref,
}: {
  title: string
  changeLabel: string
  addresses: Data.Address[]
  selectedId: number | null
  onSelect: (id: number) => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  canAddAddress: boolean
  addAddressHref: string
}) {
  const selected = addresses.find((address) => address.id === selectedId) ?? null

  return (
    <>
      {selected ? (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-4">
          <AddressDetails address={selected} />
          <Button
            type="button"
            variant="link"
            aria-label={changeLabel}
            onPress={() => onOpenChange(true)}
            className="min-h-11 shrink-0 px-2"
          >
            Ganti
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">
            Belum ada alamat dalam area layanan yang dipilih.
          </p>
          <Button
            type="button"
            variant="outline"
            onPress={() => onOpenChange(true)}
            className="h-11 shrink-0 px-3"
          >
            Pilih alamat
          </Button>
        </div>
      )}

      <Dialog
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        className="top-0 left-0 h-dvh max-w-none translate-x-0 translate-y-0 content-stretch gap-4 rounded-none p-4 sm:top-1/2 sm:left-1/2 sm:h-auto sm:max-h-[85dvh] sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:p-6"
      >
        <div className="flex min-h-0 flex-col gap-4">
          <DialogTitle className="pr-10">{title}</DialogTitle>
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
            {addresses.map((address) => {
              const isDisabled = address.isCovered === false
              const isChecked = selectedId === address.id
              return (
                <label
                  key={address.id}
                  className={cn(
                    'flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors',
                    isChecked
                      ? 'border-primary bg-accent/50'
                      : 'border-border bg-card hover:bg-muted/40',
                    isDisabled && 'cursor-not-allowed bg-muted/40 opacity-60 hover:bg-muted/40'
                  )}
                >
                  <input
                    type="radio"
                    name={title}
                    value={address.id}
                    checked={isChecked}
                    disabled={isDisabled}
                    onChange={() => {
                      onSelect(address.id)
                      onOpenChange(false)
                    }}
                    className="mt-1 size-4 shrink-0 accent-primary"
                  />
                  <AddressDetails address={address} />
                </label>
              )
            })}
          </div>
          {canAddAddress && (
            <Link
              href={addAddressHref}
              className={buttonVariants({
                variant: 'outline',
                className: 'h-11 w-full shrink-0 gap-2',
              })}
            >
              <IconMapPinPlus aria-hidden="true" className="size-4.5" />
              Tambah alamat baru
            </Link>
          )}
        </div>
      </Dialog>
    </>
  )
}
