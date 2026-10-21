import { useCallback, useRef, useState, type FormEvent } from 'react'
import { Head, router } from '@inertiajs/react'
import { toast } from 'sonner'
import { IconTrash } from '@tabler/icons-react'
import { urlFor } from '~/client'
import BackLink from '~/components/molecules/back_link'
import AddressFields, {
  type AddressField,
  type AddressFormValues,
} from '~/components/organisms/addresses/address_fields'
import { type LocationMapHandle } from '~/components/organisms/location_map'
import PickupPointPicker from '~/components/organisms/order/pickup_point_picker'
import AccountLayout from '~/components/templates/account_layout'
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
import { addressKey, useAddressPin } from '~/lib/location/address_pin'
import { locateDevice, usePointLookup } from '~/lib/location/point_lookup'
import { SERVICE_CENTER, type Coverage } from '~/lib/location/service_area'
import { suggestNearby, useAddressSuggestions } from '~/lib/location/suggest'
import type { PickupPoint } from '~/lib/location/point'
import { ADDRESS_LABELS, type AddressInput, type SavedAddress } from '~/lib/order/addresses'
import { addressError, labelError, pickErrors, recipientError } from '~/lib/shared/validation'

const FIELDS: AddressField[] = ['label', 'addressText', 'recipientName']

function initialValues(address: SavedAddress | null, recipientName: string): AddressFormValues {
  const preset = ADDRESS_LABELS.find((label) => label === address?.label)
  return {
    labelChoice: address ? (preset ?? 'Lainnya') : 'Rumah',
    customLabel: address && !preset ? address.label : '',
    addressText: address?.addressText ?? '',
    landmark: address?.landmark ?? '',
    recipientName: address?.recipientName ?? recipientName,
  }
}

function labelOf(values: AddressFormValues) {
  return values.labelChoice === 'Lainnya' ? values.customLabel.trim() : values.labelChoice
}

export default function AddressForm({
  address,
  origin,
  recipientName,
  isFirstAddress,
  coverage,
}: {
  address: SavedAddress | null
  origin: 'order' | 'addresses'
  recipientName: string
  isFirstAddress: boolean
  coverage: Coverage
}) {
  const isEditing = address !== null
  const [values, setValues] = useState(() => initialValues(address, recipientName))
  const [isPrimary, setPrimary] = useState(isFirstAddress || (address?.isPrimary ?? false))
  const isPrimaryLocked = isFirstAddress || (address?.isPrimary ?? false)
  const [errors, setErrors] = useState<Partial<Record<AddressField, string>>>({})
  const [isBusy, setBusy] = useState(false)
  const [isConfirmingDelete, setConfirmDelete] = useState(false)
  const addressRef = useRef<HTMLTextAreaElement>(null)
  const recipientRef = useRef<HTMLInputElement>(null)
  const labelRef = useRef<HTMLInputElement>(null)
  const mapRef = useRef<LocationMapHandle>(null)
  const [start] = useState<PickupPoint>(() => address?.point ?? SERVICE_CENTER)
  const [initial] = useState(() => ({
    key: address ? addressKey(address.addressText) : '',
  }))
  const [point, setPoint] = useState<PickupPoint>(start)
  const [isLocating, setLocating] = useState(false)
  const suggestions = useAddressSuggestions(values.addressText)
  const lookup = usePointLookup(point, coverage, values.addressText.split(',')[0]?.trim())
  const move = useCallback((target: PickupPoint) => mapRef.current?.moveTo(target, 17), [])
  const { adopt, pick, follow } = useAddressPin(initial.key, move)
  const best =
    suggestions.mode === 'search' && !suggestions.isLoading
      ? suggestions.items[0]?.point
      : undefined
  const backHref =
    origin === 'order' ? urlFor('customer.order.create') : urlFor('customer.addresses.index')

  function change(patch: Partial<AddressFormValues>) {
    setValues((current) => ({ ...current, ...patch }))
    if (Object.keys(errors).length) {
      setErrors({})
    }
  }

  async function locate() {
    setLocating(true)
    try {
      const here = await locateDevice()
      move(here)
      if (!values.addressText.trim()) {
        const [nearest] = await suggestNearby(here).catch(() => [])
        if (nearest) {
          adopt(nearest.value)
          change({ addressText: nearest.value })
        }
      }
    } catch {
      toast.error('Lokasi tidak bisa dibaca. Izinkan akses lokasi atau geser peta.')
    } finally {
      setLocating(false)
    }
  }

  function validate() {
    const found: Partial<Record<AddressField, string>> = {}
    const label = labelError(labelOf(values))
    const text = addressError(values.addressText)
    const recipient = recipientError(values.recipientName)
    if (label) {
      found.label = label
    }
    if (text) {
      found.addressText = text
    }
    if (recipient) {
      found.recipientName = recipient
    }
    return found
  }

  function focusFirst(found: Partial<Record<AddressField, string>>) {
    const first = FIELDS.find((key) => found[key])
    if (!first) {
      return false
    }
    const refs = { label: labelRef, addressText: addressRef, recipientName: recipientRef }
    refs[first].current?.focus()
    return true
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (isBusy) {
      return
    }
    const found = validate()
    setErrors(found)
    if (focusFirst(found)) {
      return
    }
    if (await follow(values.addressText, best)) {
      toast.info('Titik di peta disesuaikan dengan alamat Anda. Periksa, lalu tekan lagi.')
      return
    }
    if (lookup.tone === 'outside') {
      document.getElementById('pickup-point-title')?.scrollIntoView({ block: 'center' })
      return
    }

    const input: AddressInput = {
      label: labelOf(values),
      recipientName: values.recipientName.trim(),
      addressText: values.addressText.trim(),
      landmark: values.landmark.trim(),
      point,
      isPrimary: isPrimary,
    }
    const options = {
      preserveScroll: true,
      onStart: () => setBusy(true),
      onError: (serverErrors: Record<string, string | undefined>) => {
        const fieldErrors = pickErrors(serverErrors, FIELDS)
        setErrors(fieldErrors)
        if (!focusFirst(fieldErrors)) {
          toast.error(Object.values(serverErrors)[0] ?? 'Periksa kembali alamat Anda.')
        }
      },
      onFinish: () => setBusy(false),
    }

    if (isEditing) {
      router.put(urlFor('customer.addresses.update', { id: address.id }), input, options)
      return
    }
    const query = origin === 'order' ? '?dari=pesan' : ''
    router.post(`${urlFor('customer.addresses.store')}${query}`, input, options)
  }

  function remove() {
    if (!address) {
      return
    }
    router.delete(urlFor('customer.addresses.destroy', { id: address.id }), {
      onStart: () => setBusy(true),
      onFinish: () => {
        setBusy(false)
        setConfirmDelete(false)
      },
    })
  }

  return (
    <>
      <Head title={isEditing ? 'Ubah Alamat' : 'Tambah Alamat'} />
      <form
        onSubmit={submit}
        noValidate
        aria-busy={isBusy}
        className="mx-auto box-content max-w-page px-5 pt-4 lg:pt-8"
      >
        <BackLink href={backHref} label={origin === 'order' ? 'Pesan' : 'Alamat'} />
        <h1 className="mt-2 text-[28px] leading-[1.15] font-bold tracking-[-0.02em] lg:text-[34px]">
          {isEditing ? 'Ubah Alamat' : 'Tambah Alamat'}
        </h1>
        <div className="mt-5 grid items-start gap-x-10 gap-y-7 rounded-lg lg:mt-7 lg:grid-cols-2 lg:border lg:border-border lg:bg-card lg:p-6">
          <div className="flex flex-col gap-5">
            <AddressFields
              values={values}
              errors={errors}
              addressRef={addressRef}
              recipientRef={recipientRef}
              labelRef={labelRef}
              suggestions={suggestions}
              onChange={change}
              onAddressFocus={suggestions.locate}
              onAddressBlur={() => void follow(values.addressText, best)}
              onAddressPick={(suggestion) => {
                change({ addressText: suggestion.value })
                pick(suggestion)
              }}
            />
            <div>
              <Checkbox
                isSelected={isPrimary}
                onChange={setPrimary}
                isDisabled={isPrimaryLocked}
                buttonClassName="size-auto min-h-icon-btn justify-start gap-2.5 text-sm leading-[1.4] font-medium"
              >
                Jadikan alamat utama
              </Checkbox>
              {isPrimaryLocked && (
                <p className="text-meta leading-[1.4] text-muted-foreground">
                  {isFirstAddress
                    ? 'Alamat pertama otomatis jadi alamat utama.'
                    : 'Pilih alamat lain sebagai utama dari daftar alamat.'}
                </p>
              )}
            </div>
          </div>
          <PickupPointPicker
            title="Titik penjemputan"
            mapRef={mapRef}
            start={start}
            label={lookup.label}
            tone={lookup.tone}
            isLoading={lookup.loading}
            isLocating={isLocating}
            landmark={values.landmark}
            onLocate={locate}
            onMoveEnd={setPoint}
            onLandmarkChange={(landmark) => change({ landmark })}
          />
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-2.5 sm:flex-nowrap">
          {isEditing && (
            <Button
              variant="destructive-outline"
              size="cta"
              onPress={() => setConfirmDelete(true)}
              aria-label="Hapus alamat"
              className="shrink-0 gap-2 max-sm:w-cta max-sm:px-0 sm:mr-auto"
            >
              <IconTrash className="size-5.5" />
              <span className="max-sm:sr-only">Hapus Alamat</span>
            </Button>
          )}
          <Button
            type="submit"
            size="cta"
            isPending={isBusy}
            className="flex-1 sm:ml-auto sm:w-auto sm:min-w-74 sm:flex-none sm:px-7"
          >
            {isBusy ? 'Menyimpan…' : 'Simpan Alamat'}
          </Button>
        </div>
      </form>
      <Dialog isOpen={isConfirmingDelete} onOpenChange={setConfirmDelete} role="alertdialog">
        <DialogHeader>
          <DialogTitle>Hapus alamat {address?.label}?</DialogTitle>
          <DialogDescription>
            Pesanan yang sudah dibuat tetap memakai alamat lamanya. Tindakan ini tidak bisa
            dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose size="cta" className="sm:size-auto sm:h-btn">
            Batal
          </DialogClose>
          <Button
            variant="destructive"
            size="cta"
            onPress={remove}
            isPending={isBusy}
            className="sm:h-btn"
          >
            Hapus Alamat
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  )
}

AddressForm.layout = [AccountLayout]
