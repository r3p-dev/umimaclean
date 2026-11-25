import { useState, type ReactNode, type SyntheticEvent } from 'react'
import { Head, router } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import {
  IconBackpack,
  IconHelmet,
  IconInfoCircle,
  IconMapPinPlus,
  IconPlus,
  IconShoe,
  IconTrash,
} from '@tabler/icons-react'
import type { Data } from '@generated/data'
import { cn } from 'cn'
import { urlFor } from '~/client'
import Note from '~/components/atoms/note'
import AddressPicker from '~/components/organisms/address_picker'
import CustomerLayout from '~/components/templates/customer_layout'
import { Badge } from '~/components/ui/badge'
import { Button, buttonVariants } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Field, FieldError, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { BAG_SIZE_OPTIONS, SHOE_SIZES, formatPickupDate, formatSlotTime } from '~/lib/order_format'
import { ItemKind } from '~/lib/service_enums'

type OrderableKind = typeof ItemKind.SHOE | typeof ItemKind.BAG

type DraftItem = {
  itemKind: OrderableKind
  brand: string
  type: string
  size: string
}

type SlotOption = {
  id: number
  startsAt: string
  endsAt: string
  capacity: number
  isActive: boolean
  taken: number
  isAvailable: boolean
}

type OrderDraftProp = {
  items: { itemKind: string; brand?: string; type: string; size: string }[]
  pickupAddressId: number
  deliveryAddressId: number
  pickupDate: string
  pickupSlotId: number
  note?: string
}

const MAX_PER_KIND = 20
const MAX_NOTE_LENGTH = 300

const SELECT_CLASS =
  'flex h-12 w-full rounded-md border border-input bg-card px-3 py-2 text-base text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20'

function emptyItem(itemKind: OrderableKind): DraftItem {
  return { itemKind, brand: '', type: '', size: '' }
}

function initialItems(
  draft: OrderDraftProp | null,
  repeatItems: { itemKind: string; brand: string; type: string; size: string }[] | null
): DraftItem[] {
  const source = draft?.items ?? repeatItems
  if (source && source.length > 0) {
    return source.map((item) => ({
      itemKind: item.itemKind === ItemKind.BAG ? ItemKind.BAG : ItemKind.SHOE,
      brand: item.brand ?? '',
      type: item.type,
      size: item.size,
    }))
  }
  return [emptyItem(ItemKind.SHOE)]
}

function initialAddressId(addresses: Data.Address[], preferredId?: number) {
  const covered = addresses.filter((address) => address.isCovered !== false)
  if (preferredId && covered.some((address) => address.id === preferredId)) {
    return preferredId
  }
  return covered[0]?.id ?? null
}

function firstAvailableSlotId(slots: SlotOption[]) {
  return slots.find((slot) => slot.isAvailable)?.id ?? null
}

// CUST-5: online order form (`/pesan`). Validates into session draft, then `/pesan/konfirmasi`.
export default function OrderCreate({
  addresses,
  canAddAddress,
  dates,
  slotsByDate,
  draft,
  repeatItems,
}: {
  addresses: Data.Address[]
  canAddAddress: boolean
  dates: string[]
  slotsByDate: Record<string, SlotOption[]>
  draft: OrderDraftProp | null
  repeatItems: { itemKind: string; brand: string; type: string; size: string }[] | null
}) {
  const [items, setItems] = useState<DraftItem[]>(() => initialItems(draft, repeatItems))
  const [pickupAddressId, setPickupAddressId] = useState<number | null>(() =>
    initialAddressId(addresses, draft?.pickupAddressId)
  )
  const [sameDelivery, setSameDelivery] = useState<boolean>(() =>
    draft ? draft.deliveryAddressId === draft.pickupAddressId : true
  )
  const [deliveryAddressId, setDeliveryAddressId] = useState<number | null>(() =>
    initialAddressId(addresses, draft?.deliveryAddressId)
  )
  const [pickupDate, setPickupDate] = useState<string>(() =>
    draft?.pickupDate && dates.includes(draft.pickupDate) ? draft.pickupDate : (dates[0] ?? '')
  )
  const [pickupSlotId, setPickupSlotId] = useState<number | null>(() => {
    const initialDate =
      draft?.pickupDate && dates.includes(draft.pickupDate) ? draft.pickupDate : (dates[0] ?? '')
    const slots = slotsByDate[initialDate] ?? []
    if (draft?.pickupSlotId && slots.some((s) => s.id === draft.pickupSlotId && s.isAvailable)) {
      return draft.pickupSlotId
    }
    return firstAvailableSlotId(slots)
  })
  const [note, setNote] = useState<string>(draft?.note ?? '')
  const [isPickupPickerOpen, setIsPickupPickerOpen] = useState(false)
  const [isDeliveryPickerOpen, setIsDeliveryPickerOpen] = useState(false)
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const shoeCount = items.filter((item) => item.itemKind === ItemKind.SHOE).length
  const bagCount = items.filter((item) => item.itemKind === ItemKind.BAG).length
  const currentSlots = slotsByDate[pickupDate] ?? []
  const effectiveDeliveryId = sameDelivery ? pickupAddressId : deliveryAddressId

  function updateItem(index: number, patch: Partial<DraftItem>) {
    setItems((current) =>
      current.map((item, idx) => {
        if (idx !== index) return item
        const next = { ...item, ...patch }
        if (patch.itemKind && patch.itemKind !== item.itemKind) {
          next.size = ''
        }
        return next
      })
    )
  }

  function addItem(kind: OrderableKind) {
    if (kind === ItemKind.SHOE && shoeCount >= MAX_PER_KIND) return
    if (kind === ItemKind.BAG && bagCount >= MAX_PER_KIND) return
    setItems((current) => [...current, emptyItem(kind)])
  }

  function removeItem(index: number) {
    if (items.length <= 1) return
    setItems((current) => current.filter((_, idx) => idx !== index))
  }

  function selectDate(nextDate: string) {
    setPickupDate(nextDate)
    const slots = slotsByDate[nextDate] ?? []
    const keepsSlot = slots.some((slot) => slot.id === pickupSlotId && slot.isAvailable)
    if (!keepsSlot) {
      setPickupSlotId(firstAvailableSlotId(slots))
    }
  }

  function submitOrder(event: SyntheticEvent) {
    event.preventDefault()
    if (isSubmitting) return
    router.post(
      urlFor('customer.orders.draft'),
      {
        items: items.map((item) => ({
          itemKind: item.itemKind,
          brand: item.brand.trim() || undefined,
          type: item.type.trim(),
          size: item.size,
        })),
        pickupAddressId: pickupAddressId ?? '',
        deliveryAddressId: effectiveDeliveryId ?? '',
        pickupDate,
        pickupSlotId: pickupSlotId ?? '',
        note: note.trim() || undefined,
      },
      {
        preserveScroll: true,
        onStart: () => setIsSubmitting(true),
        onError: (validationErrors) => setErrors(validationErrors),
        onFinish: () => setIsSubmitting(false),
      }
    )
  }

  const addAddressHref = `${urlFor('customer.addresses.create')}?dari=pesan`
  const canProceed =
    items.length > 0 &&
    pickupAddressId !== null &&
    effectiveDeliveryId !== null &&
    pickupSlotId !== null

  return (
    <div className="mx-auto max-w-6xl px-5 pt-6 lg:pt-10">
      <Head title="Pesan Penjemputan" />

      <div>
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Pesan Penjemputan</h1>
        <p className="mt-1 text-base text-muted-foreground">
          Isi barang yang akan dijemput, pilih alamat, dan tentukan jadwalnya.
        </p>
      </div>

      <form onSubmit={submitOrder} className="mt-5 flex flex-col gap-8">
        <section aria-labelledby="items-section-title" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="items-section-title" className="text-lg font-semibold">
              Barang
            </h2>
            <p className="text-sm text-muted-foreground">
              Sepatu: {shoeCount}/{MAX_PER_KIND} · Tas: {bagCount}/{MAX_PER_KIND}
            </p>
          </div>

          <Note
            tone="info"
            icon={<IconHelmet aria-hidden="true" className="mt-px size-4.5 shrink-0" />}
          >
            Cuci helm hanya untuk helm yang dibawa langsung ke toko.
          </Note>

          {errors.items && <FieldError>{errors.items}</FieldError>}

          <div className="flex flex-col gap-4">
            {items.map((item, index) => {
              const typeError = errors[`items.${index}.type`]
              const brandError = errors[`items.${index}.brand`]
              const sizeError = errors[`items.${index}.size`]
              const isShoe = item.itemKind === ItemKind.SHOE
              return (
                <div
                  key={index}
                  className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-muted-foreground">
                      Barang {index + 1}
                    </span>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Hapus barang ${index + 1}`}
                        onPress={() => removeItem(index)}
                        className="-my-3 -mr-2 size-11 text-muted-foreground hover:text-destructive"
                      >
                        <IconTrash aria-hidden="true" className="size-5" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={isShoe ? 'default' : 'outline'}
                      onPress={() => updateItem(index, { itemKind: ItemKind.SHOE })}
                      className="h-11 gap-2"
                    >
                      <IconShoe aria-hidden="true" className="size-5" />
                      Sepatu
                    </Button>
                    <Button
                      type="button"
                      variant={!isShoe ? 'default' : 'outline'}
                      onPress={() => updateItem(index, { itemKind: ItemKind.BAG })}
                      className="h-11 gap-2"
                    >
                      <IconBackpack aria-hidden="true" className="size-5" />
                      Tas
                    </Button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field data-invalid={typeError ? true : undefined}>
                      <FieldLabel htmlFor={`item-type-${index}`}>Jenis barang</FieldLabel>
                      <Input
                        id={`item-type-${index}`}
                        value={item.type}
                        onChange={(event) => updateItem(index, { type: event.target.value })}
                        placeholder={isShoe ? 'mis. Air Force 1' : 'mis. Ransel kanvas'}
                        maxLength={80}
                        required
                        aria-invalid={typeError ? true : undefined}
                        aria-describedby={typeError ? `item-type-${index}-error` : undefined}
                        className="h-12"
                      />
                      {typeError && (
                        <FieldError id={`item-type-${index}-error`}>{typeError}</FieldError>
                      )}
                    </Field>

                    <Field data-invalid={brandError ? true : undefined}>
                      <FieldLabel htmlFor={`item-brand-${index}`}>
                        <span>
                          Merk <span className="font-normal text-muted-foreground">(opsional)</span>
                        </span>
                      </FieldLabel>
                      <Input
                        id={`item-brand-${index}`}
                        value={item.brand}
                        onChange={(event) => updateItem(index, { brand: event.target.value })}
                        placeholder={isShoe ? 'mis. Nike' : 'mis. Fjallraven'}
                        maxLength={60}
                        aria-invalid={brandError ? true : undefined}
                        className="h-12"
                      />
                      {brandError && <FieldError>{brandError}</FieldError>}
                    </Field>
                  </div>

                  <Field data-invalid={sizeError ? true : undefined}>
                    <FieldLabel htmlFor={`item-size-${index}`}>
                      {isShoe ? 'Ukuran (EU)' : 'Ukuran tas'}
                    </FieldLabel>
                    <select
                      id={`item-size-${index}`}
                      value={item.size}
                      onChange={(event) => updateItem(index, { size: event.target.value })}
                      required
                      aria-invalid={sizeError ? true : undefined}
                      aria-describedby={sizeError ? `item-size-${index}-error` : undefined}
                      className={SELECT_CLASS}
                    >
                      <option value="">Pilih ukuran</option>
                      {isShoe
                        ? SHOE_SIZES.map((size) => (
                            <option key={size} value={size}>
                              EU {size}
                            </option>
                          ))
                        : BAG_SIZE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                    </select>
                    {sizeError && (
                      <FieldError id={`item-size-${index}-error`}>{sizeError}</FieldError>
                    )}
                  </Field>
                </div>
              )
            })}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              isDisabled={shoeCount >= MAX_PER_KIND}
              onPress={() => addItem(ItemKind.SHOE)}
              className="h-11 gap-2 px-4"
            >
              <IconPlus aria-hidden="true" className="size-4.5" />
              Tambah sepatu
            </Button>
            <Button
              type="button"
              variant="outline"
              isDisabled={bagCount >= MAX_PER_KIND}
              onPress={() => addItem(ItemKind.BAG)}
              className="h-11 gap-2 px-4"
            >
              <IconPlus aria-hidden="true" className="size-4.5" />
              Tambah tas
            </Button>
          </div>
        </section>

        <section aria-labelledby="address-section-title" className="flex flex-col gap-4">
          <h2 id="address-section-title" className="text-lg font-semibold">
            Alamat penjemputan
          </h2>

          {addresses.length === 0 ? (
            <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-border bg-card p-5">
              <p className="text-base font-semibold">Belum ada alamat tersimpan</p>
              <p className="text-sm text-muted-foreground">
                Tambahkan alamat penjemputan di Bandung Raya terlebih dahulu.
              </p>
              <Link
                href={addAddressHref}
                className={buttonVariants({ variant: 'outline', className: 'h-11 gap-2 px-4' })}
              >
                <IconMapPinPlus aria-hidden="true" className="size-4.5" />
                Tambah alamat
              </Link>
            </div>
          ) : (
            <>
              <AddressPicker
                title="Pilih alamat penjemputan"
                changeLabel="Ganti alamat penjemputan"
                addresses={addresses}
                selectedId={pickupAddressId}
                onSelect={setPickupAddressId}
                isOpen={isPickupPickerOpen}
                onOpenChange={setIsPickupPickerOpen}
                canAddAddress={canAddAddress}
                addAddressHref={addAddressHref}
              />
              {errors.pickupAddressId && <FieldError>{errors.pickupAddressId}</FieldError>}

              <div className="flex flex-col gap-3">
                <Checkbox
                  isSelected={sameDelivery}
                  onChange={setSameDelivery}
                  className="min-h-11 items-center"
                >
                  Alamat pengantaran sama dengan penjemputan
                </Checkbox>

                {!sameDelivery && (
                  <div className="flex flex-col gap-2">
                    <h3 className="text-base font-semibold">Alamat pengantaran</h3>
                    <AddressPicker
                      title="Pilih alamat pengantaran"
                      changeLabel="Ganti alamat pengantaran"
                      addresses={addresses}
                      selectedId={deliveryAddressId}
                      onSelect={setDeliveryAddressId}
                      isOpen={isDeliveryPickerOpen}
                      onOpenChange={setIsDeliveryPickerOpen}
                      canAddAddress={canAddAddress}
                      addAddressHref={addAddressHref}
                    />
                  </div>
                )}
                {errors.deliveryAddressId && <FieldError>{errors.deliveryAddressId}</FieldError>}
              </div>
            </>
          )}
        </section>

        <section aria-labelledby="schedule-section-title" className="flex flex-col gap-4">
          <h2 id="schedule-section-title" className="text-lg font-semibold">
            Jadwal penjemputan
          </h2>

          {dates.length === 0 ? (
            <Note tone="attention">Belum ada tanggal penjemputan yang tersedia.</Note>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">Tanggal</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {dates.map((date) => (
                    <Button
                      key={date}
                      type="button"
                      variant={pickupDate === date ? 'default' : 'outline'}
                      onPress={() => selectDate(date)}
                      className="h-11 justify-center px-3 text-sm"
                    >
                      {formatPickupDate(date)}
                    </Button>
                  ))}
                </div>
                {errors.pickupDate && <FieldError>{errors.pickupDate}</FieldError>}
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">Jam penjemputan</p>
                <div className="flex flex-col gap-2">
                  {currentSlots.map((slot) => {
                    const statusText = !slot.isActive
                      ? 'Tutup'
                      : slot.taken >= slot.capacity
                        ? 'Penuh'
                        : null
                    const isDisabled = !slot.isAvailable
                    return (
                      <label
                        key={slot.id}
                        className={cn(
                          'flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-colors',
                          pickupSlotId === slot.id
                            ? 'border-primary bg-accent/50'
                            : 'border-border bg-card hover:bg-muted/40',
                          isDisabled &&
                            'cursor-not-allowed bg-muted/40 opacity-60 hover:bg-muted/40'
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="pickupSlotId"
                            value={slot.id}
                            checked={pickupSlotId === slot.id}
                            disabled={isDisabled}
                            onChange={() => setPickupSlotId(slot.id)}
                            className="size-4 accent-primary"
                          />
                          <span className="text-base font-medium tabular-nums">
                            {formatSlotTime(slot.startsAt, slot.endsAt)}
                          </span>
                        </span>
                        {statusText && <Badge variant="secondary">{statusText}</Badge>}
                      </label>
                    )
                  })}
                </div>
                {errors.pickupSlotId && <FieldError>{errors.pickupSlotId}</FieldError>}
              </div>
            </>
          )}
        </section>

        <section aria-labelledby="note-section-title" className="flex flex-col gap-3">
          <h2 id="note-section-title" className="text-lg font-semibold">
            Catatan
          </h2>
          <Field data-invalid={errors.note ? true : undefined}>
            <div className="flex items-center justify-between gap-2">
              <FieldLabel htmlFor="order-note">
                <span>
                  Catatan untuk kurir{' '}
                  <span className="font-normal text-muted-foreground">(opsional)</span>
                </span>
              </FieldLabel>
              <span className="text-xs text-muted-foreground tabular-nums">
                {note.length}/{MAX_NOTE_LENGTH}
              </span>
            </div>
            <Textarea
              id="order-note"
              value={note}
              onChange={(event) => setNote(event.target.value.slice(0, MAX_NOTE_LENGTH))}
              rows={3}
              maxLength={MAX_NOTE_LENGTH}
              placeholder="mis. sepatu putih ada noda kopi di bagian depan"
              aria-invalid={errors.note ? true : undefined}
            />
            {errors.note && <FieldError>{errors.note}</FieldError>}
          </Field>
        </section>

        <Note
          tone="info"
          icon={<IconInfoCircle aria-hidden="true" className="mt-px size-4.5 shrink-0" />}
        >
          Layanan dan harga ditentukan tim kami setelah barang diperiksa.
        </Note>

        <div className="sticky bottom-16 z-20 -mx-5 border-t border-border bg-card px-5 py-4 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
          <Button
            type="submit"
            isDisabled={!canProceed || isSubmitting}
            className="h-12 w-full text-base"
          >
            {isSubmitting ? 'Memeriksa…' : 'Lanjut ke Konfirmasi'}
          </Button>
        </div>
      </form>
    </div>
  )
}

OrderCreate.layout = (page: ReactNode) => <CustomerLayout active="pesan">{page}</CustomerLayout>
