import { useState } from 'react'
import { Link } from '@adonisjs/inertia/react'
import { IconMapPinPlus } from '@tabler/icons-react'
import { urlFor } from '~/client'
import ChoiceRow from '~/components/molecules/choice_row'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Dialog, DialogTitle } from '~/components/ui/dialog'
import type { SavedAddress } from '~/lib/order/addresses'

export type AddressSelection = { pickupId: number; deliveryId: number | null }

const ADD_LINK =
  'flex h-13 items-center gap-2.5 rounded-md border border-dashed border-border-strong px-3.5 text-[15px] leading-none font-semibold text-primary hover:bg-accent'

function AddressOptions({
  label,
  addresses,
  value,
  onChange,
}: {
  label: string
  addresses: SavedAddress[]
  value: number | null
  onChange: (id: number) => void
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-col gap-2.5">
      {addresses.map((address) => (
        <ChoiceRow
          key={address.id}
          role="radio"
          isChecked={value === address.id}
          onChange={() => onChange(address.id)}
          className="items-start gap-3 p-3.5 [&>svg]:mt-px [&>svg]:size-5.5"
        >
          <span className="flex flex-1 flex-col gap-1 text-foreground">
            <span className="flex items-center gap-2 text-[15px] leading-[1.2] font-semibold">
              {address.label}
              {address.isPrimary && (
                <span className="rounded-pill bg-accent px-2 py-1 text-xs leading-none font-semibold text-accent-foreground">
                  Utama
                </span>
              )}
            </span>
            <span className="text-sm leading-[1.4] font-normal text-foreground-secondary">
              {address.addressText}
            </span>
          </span>
        </ChoiceRow>
      ))}
    </div>
  )
}

function SheetBody({
  addresses,
  initial,
  canAdd,
  onConfirm,
}: {
  addresses: SavedAddress[]
  initial: AddressSelection
  canAdd: boolean
  onConfirm: (selection: AddressSelection) => void
}) {
  const [pickupId, setPickupId] = useState(initial.pickupId)
  const [deliveryId, setDeliveryId] = useState(initial.deliveryId)
  const [isSeparate, setSeparate] = useState(initial.deliveryId !== null)

  return (
    <>
      <div className="flex items-center justify-between">
        <DialogTitle className="text-[19px] leading-[1.3]">Dijemput di mana?</DialogTitle>
        <Link
          href={urlFor('customer.addresses.index')}
          className="box-content inline-flex min-h-11 items-center py-2 text-sm leading-none font-semibold text-primary hover:text-primary-hover hover:underline"
        >
          Kelola
        </Link>
      </div>
      <AddressOptions
        label="Alamat penjemputan"
        addresses={addresses}
        value={pickupId}
        onChange={setPickupId}
      />
      {canAdd && (
        <Link href={`${urlFor('customer.addresses.create')}?dari=pesan`} className={ADD_LINK}>
          <IconMapPinPlus className="size-5.5" />
          Tambah alamat baru
        </Link>
      )}
      {addresses.length > 1 && (
        <Checkbox
          isSelected={isSeparate}
          onChange={setSeparate}
          buttonClassName="size-auto min-h-icon-btn w-full justify-start gap-2.5 text-sm leading-[1.4] text-foreground-secondary"
        >
          Antar kembali ke alamat yang berbeda
        </Checkbox>
      )}
      {isSeparate && (
        <section aria-labelledby="delivery-title" className="flex flex-col gap-2.5">
          <h3 id="delivery-title" className="text-base leading-[1.3] font-semibold">
            Diantar ke mana?
          </h3>
          <AddressOptions
            label="Alamat pengantaran"
            addresses={addresses.filter((address) => address.id !== pickupId)}
            value={deliveryId}
            onChange={setDeliveryId}
          />
        </section>
      )}
      <Button
        size="cta"
        isDisabled={isSeparate && (!deliveryId || deliveryId === pickupId)}
        onPress={() =>
          onConfirm({
            pickupId,
            deliveryId: isSeparate && deliveryId !== pickupId ? deliveryId : null,
          })
        }
      >
        Pakai Alamat Ini
      </Button>
    </>
  )
}

export default function AddressSheet({
  isOpen,
  onOpenChange,
  addresses,
  initial,
  canAdd,
  onConfirm,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  addresses: SavedAddress[]
  initial: AddressSelection
  canAdd: boolean
  onConfirm: (selection: AddressSelection) => void
}) {
  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange}>
      {isOpen && (
        <SheetBody
          addresses={addresses}
          initial={initial}
          canAdd={canAdd}
          onConfirm={(selection) => {
            onConfirm(selection)
            onOpenChange(false)
          }}
        />
      )}
    </Dialog>
  )
}
