import { useState, type ReactNode } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { Form, Link } from '@adonisjs/inertia/react'
import { IconArrowLeft, IconTrash } from '@tabler/icons-react'
import type { Data } from '@generated/data'
import { urlFor } from '~/client'
import CsrfField from '~/components/atoms/csrf_field'
import PhoneInput from '~/components/molecules/phone_input'
import PlaceSearch from '~/components/molecules/place_search'
import PinPicker from '~/components/organisms/pin_picker'
import CustomerLayout from '~/components/templates/customer_layout'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '~/components/ui/toggle_group'
import type { MapPoint } from '~/lib/map/area_map'

// CUST-3: "Rumah", "Kantor" or a label the customer types.
const LABELS = ['Rumah', 'Kantor'] as const
const CUSTOM_LABEL = 'Lainnya'
// Alun-alun Bandung: where a new address's pin starts.
const NEW_PIN_START: MapPoint = { lat: -6.9218, lng: 107.6098 }

// CUST-14: add or edit one address on one page (D109): contact, then the address text (which is also
// the place search), other details and the map pin, then the label. The server checks the pin and
// reads the area under it again on save (AREA-4).
export default function AddressForm({
  address,
  isFirstAddress,
  shapes,
  tilesUrl,
  devWarning,
}: {
  address: Data.Address | null
  isFirstAddress: boolean
  shapes: Data.ServiceAreaShape[]
  tilesUrl: string | null
  devWarning: string | null
}) {
  const user = usePage().props.user
  const isPreset = LABELS.some((label) => label === address?.label)
  const [labelChoice, setLabelChoice] = useState<string>(
    address ? (isPreset ? address.label : CUSTOM_LABEL) : 'Rumah'
  )
  const [customLabel, setCustomLabel] = useState(address && !isPreset ? address.label : '')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeletePending, setIsDeletePending] = useState(false)
  // The point under the pin, which ranks the place search, and where a search or the device's
  // location moves the pin to.
  // Only the point: the pin is sent as the coverage check's query string.
  const [pin, setPin] = useState<MapPoint>(
    address ? { lat: address.lat, lng: address.lng } : NEW_PIN_START
  )
  const [pinTarget, setPinTarget] = useState<MapPoint | null>(null)
  const [addressText, setAddressText] = useState(address?.addressText ?? '')
  const isPrimaryLocked = isFirstAddress || (address?.isPrimary ?? false)
  const title = address ? 'Ubah alamat' : 'Tambah alamat'

  function deleteAddress() {
    if (!address) {
      return
    }
    router.delete(urlFor('customer.addresses.destroy', { id: address.id }), {
      onStart: () => setIsDeletePending(true),
      onFinish: () => setIsDeletePending(false),
    })
  }

  function renderFields({
    errors,
    processing,
    clearErrors,
  }: {
    errors: Record<string, string | undefined>
    processing: boolean
    clearErrors: (...fields: ('lat' | 'lng')[]) => void
  }) {
    function movePin(point: MapPoint) {
      setPin(point)
      // The pin has arrived: a map mounted later (the layout switching between phone and desktop)
      // must start from here, not jump back to an old search result.
      setPinTarget(null)
      // A save refused for the old pin no longer applies to the new one (D109).
      clearErrors('lat', 'lng')
    }

    return (
      <>
        <CsrfField />
        <div className="flex flex-col gap-8">
          <section aria-labelledby="contact-title" className="flex flex-col gap-5">
            <h2 id="contact-title" className="text-lg font-semibold">
              Kontak
            </h2>
            <Field data-invalid={errors.recipientName ? true : undefined}>
              <FieldLabel htmlFor="recipientName">Nama penerima</FieldLabel>
              <Input
                id="recipientName"
                name="recipientName"
                autoComplete="name"
                defaultValue={address?.recipientName ?? user?.fullName}
                maxLength={80}
                required
                aria-invalid={errors.recipientName ? true : undefined}
                aria-describedby={errors.recipientName ? 'recipientName-error' : undefined}
                className="h-12"
              />
              {errors.recipientName && (
                <FieldError id="recipientName-error">{errors.recipientName}</FieldError>
              )}
            </Field>
            <PhoneInput
              id="recipientPhone"
              label="Nomor WhatsApp penerima"
              defaultValue={address?.recipientPhone ?? user?.phone}
              error={errors.recipientPhone}
              required
            />
          </section>

          <section aria-labelledby="address-title" className="flex flex-col gap-5">
            <h2 id="address-title" className="text-lg font-semibold">
              Alamat
            </h2>
            <PlaceSearch
              text={addressText}
              onTextChange={setAddressText}
              near={pin}
              error={errors.addressText}
              onPick={(point) => {
                movePin(point)
                setPinTarget(point)
              }}
            />
            <Field data-invalid={errors.details ? true : undefined}>
              <FieldLabel htmlFor="details">
                <span>
                  Detail lainnya (cth: blok / unit no., patokan){' '}
                  <span className="font-normal text-muted-foreground">(opsional)</span>
                </span>
              </FieldLabel>
              <Input
                id="details"
                name="details"
                defaultValue={address?.details ?? ''}
                maxLength={160}
                aria-invalid={errors.details ? true : undefined}
                aria-describedby={errors.details ? 'details-error' : undefined}
                className="h-12"
              />
              {errors.details && <FieldError id="details-error">{errors.details}</FieldError>}
            </Field>
            <PinPicker
              point={pin}
              addressText={addressText}
              target={pinTarget}
              onTargetChange={setPinTarget}
              onPointChange={movePin}
              shapes={shapes}
              tilesUrl={tilesUrl}
              devWarning={devWarning}
              error={errors.lat ?? errors.lng}
            />
          </section>

          <section aria-labelledby="settings-title" className="flex flex-col gap-5">
            <h2 id="settings-title" className="text-lg font-semibold">
              Pengaturan
            </h2>
            <Field data-invalid={errors.label ? true : undefined}>
              <FieldLabel id="label-title">Tandai sebagai</FieldLabel>
              <ToggleGroup
                aria-labelledby="label-title"
                variant="outline"
                selectionMode="single"
                disallowEmptySelection
                selectedKeys={[labelChoice]}
                onSelectionChange={(keys) => setLabelChoice(String([...keys][0]))}
                className="flex-wrap"
              >
                {[...LABELS, CUSTOM_LABEL].map((label) => (
                  <ToggleGroupItem key={label} id={label} className="h-11 px-4 text-base">
                    {label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              {labelChoice === CUSTOM_LABEL && (
                <Input
                  aria-label="Nama label"
                  placeholder="mis. Rumah Ibu"
                  value={customLabel}
                  maxLength={30}
                  onChange={(event) => setCustomLabel(event.target.value)}
                  aria-invalid={errors.label ? true : undefined}
                  aria-describedby={errors.label ? 'label-error' : undefined}
                  className="h-12"
                />
              )}
              <input
                type="hidden"
                name="label"
                value={labelChoice === CUSTOM_LABEL ? customLabel : labelChoice}
              />
              {errors.label && <FieldError id="label-error">{errors.label}</FieldError>}
            </Field>

            <div className="flex flex-col gap-1">
              <Checkbox
                name="isPrimary"
                value="true"
                defaultSelected={isPrimaryLocked}
                isDisabled={isPrimaryLocked}
              >
                Jadikan alamat utama
              </Checkbox>
              {isPrimaryLocked && (
                <p className="text-sm text-muted-foreground">
                  {isFirstAddress
                    ? 'Alamat pertama otomatis jadi alamat utama.'
                    : 'Pilih alamat lain sebagai utama dari daftar alamat.'}
                </p>
              )}
            </div>
          </section>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 sm:flex-nowrap">
          {address && (
            <Button
              variant="outline"
              onPress={() => setIsDeleting(true)}
              className="h-12 gap-2 px-4 sm:mr-auto"
            >
              <IconTrash aria-hidden="true" className="size-5" />
              Hapus alamat
            </Button>
          )}
          <Button
            type="submit"
            isDisabled={processing}
            className="h-12 flex-1 px-6 text-base sm:ml-auto sm:flex-none"
          >
            {processing ? 'Menyimpan…' : 'Simpan alamat'}
          </Button>
        </div>
      </>
    )
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-5 pt-4 pb-8 sm:pt-10">
      <Head title={address ? 'Ubah Alamat' : 'Tambah Alamat'} />
      <Link
        route="customer.addresses.index"
        className="inline-flex min-h-11 items-center gap-2 self-start text-sm font-medium text-foreground/80 hover:text-foreground"
      >
        <IconArrowLeft aria-hidden="true" className="size-4.5" />
        Alamat
      </Link>
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>

      {address ? (
        <Form
          route="customer.addresses.update"
          routeParams={{ id: address.id }}
          options={{ preserveScroll: true }}
        >
          {renderFields}
        </Form>
      ) : (
        <Form route="customer.addresses.store" options={{ preserveScroll: true }}>
          {renderFields}
        </Form>
      )}

      <Dialog isOpen={isDeleting} onOpenChange={setIsDeleting}>
        <DialogHeader>
          <DialogTitle>Hapus alamat {address?.label}?</DialogTitle>
          <DialogDescription>
            {address?.isPrimary
              ? 'Alamat terbaru yang tersisa akan jadi alamat utama. Tindakan ini tidak bisa dibatalkan.'
              : 'Tindakan ini tidak bisa dibatalkan.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose variant="outline" className="h-11">
            Batal
          </DialogClose>
          <Button
            variant="destructive"
            isDisabled={isDeletePending}
            onPress={deleteAddress}
            className="h-11"
          >
            Hapus alamat
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}

AddressForm.layout = (page: ReactNode) => <CustomerLayout active="profil">{page}</CustomerLayout>
