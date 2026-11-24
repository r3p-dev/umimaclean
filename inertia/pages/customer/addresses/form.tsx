import { useState, type ReactNode } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { Form, Link } from '@adonisjs/inertia/react'
import { IconArrowLeft, IconTrash } from '@tabler/icons-react'
import type { Data } from '@generated/data'
import { urlFor } from '~/client'
import CsrfField from '~/components/atoms/csrf_field'
import PhoneInput from '~/components/molecules/phone_input'
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
import { Field, FieldDescription, FieldError, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '~/components/ui/toggle_group'
import type { MapPoint } from '~/lib/map/area_map'

// CUST-3: "Rumah", "Kantor" or a label the customer types.
const LABELS = ['Rumah', 'Kantor'] as const
const CUSTOM_LABEL = 'Lainnya'
// Alun-alun Bandung: where a new address's pin starts.
const NEW_PIN_START: MapPoint = { lat: -6.9218, lng: 107.6098 }

// CUST-14: add or edit one address; the pin is checked by the server when it stops and on save (AREA-4).
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
  }: {
    errors: Record<string, string | undefined>
    processing: boolean
  }) {
    return (
      <>
        <CsrfField />
        <div className="grid items-start gap-x-10 gap-y-6 lg:grid-cols-2 lg:rounded-lg lg:border lg:border-border lg:bg-card lg:p-6">
          <div className="flex flex-col gap-5">
            <Field data-invalid={errors.label ? true : undefined}>
              <FieldLabel id="label-title">Simpan sebagai</FieldLabel>
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

            <Field data-invalid={errors.addressText ? true : undefined}>
              <FieldLabel htmlFor="addressText">Alamat lengkap</FieldLabel>
              <Textarea
                id="addressText"
                name="addressText"
                defaultValue={address?.addressText}
                maxLength={300}
                required
                aria-invalid={errors.addressText ? true : undefined}
                aria-describedby={errors.addressText ? 'addressText-error' : 'addressText-help'}
                className="min-h-24 text-base"
              />
              {errors.addressText ? (
                <FieldError id="addressText-error">{errors.addressText}</FieldError>
              ) : (
                <FieldDescription id="addressText-help">
                  Nama jalan, nomor rumah, RT/RW, nama gedung.
                </FieldDescription>
              )}
            </Field>

            <Field data-invalid={errors.landmark ? true : undefined}>
              <FieldLabel htmlFor="landmark">
                Patokan <span className="font-normal text-muted-foreground">(opsional)</span>
              </FieldLabel>
              <Input
                id="landmark"
                name="landmark"
                defaultValue={address?.landmark ?? ''}
                maxLength={120}
                placeholder="mis. pagar hitam, sebelah warung"
                aria-invalid={errors.landmark ? true : undefined}
                aria-describedby={errors.landmark ? 'landmark-error' : undefined}
                className="h-12"
              />
              {errors.landmark && <FieldError id="landmark-error">{errors.landmark}</FieldError>}
            </Field>

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
                aria-describedby={
                  errors.recipientName ? 'recipientName-error' : 'recipientName-help'
                }
                className="h-12"
              />
              {errors.recipientName ? (
                <FieldError id="recipientName-error">{errors.recipientName}</FieldError>
              ) : (
                <FieldDescription id="recipientName-help">
                  Ganti bila yang menyerahkan barang orang lain.
                </FieldDescription>
              )}
            </Field>

            <PhoneInput
              id="recipientPhone"
              label="Nomor WhatsApp penerima"
              defaultValue={address?.recipientPhone ?? user?.phone}
              error={errors.recipientPhone}
              description="Dihubungi staf saat menjemput dan mengantar."
              required
            />

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
          </div>

          <section aria-labelledby="pin-title" className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-col gap-1">
              <h2 id="pin-title" className="text-lg font-semibold">
                Titik penjemputan
              </h2>
              <p className="text-sm text-muted-foreground">
                Geser peta atau pakai tombol panah sampai ujung penanda tepat di rumah Anda.
              </p>
            </div>
            <PinPicker
              start={address ? { lat: address.lat, lng: address.lng } : NEW_PIN_START}
              shapes={shapes}
              tilesUrl={tilesUrl}
              devWarning={devWarning}
              error={errors.lat ?? errors.lng}
            />
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
    <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 pt-4 pb-8 sm:pt-10">
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
