import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { Head, router } from '@inertiajs/react'
import { toast } from 'sonner'
import { IconLock } from '@tabler/icons-react'
import { urlFor } from '~/client'
import BackLink from '~/components/molecules/back_link'
import InfoNote from '~/components/molecules/info_note'
import StepProgress from '~/components/molecules/step_progress'
import FlowFooter from '~/components/organisms/flow_footer'
import FlowHeader from '~/components/organisms/flow_header'
import { type LocationMapHandle } from '~/components/organisms/location_map'
import CustomerDetailsFields, {
  type DetailsField,
} from '~/components/organisms/order/customer_details_fields'
import PickupPointPicker from '~/components/organisms/order/pickup_point_picker'
import FlowLayout from '~/components/templates/flow_layout'
import { Button } from '~/components/ui/button'
import { addressKey, useAddressPin } from '~/lib/location/address_pin'
import { locateDevice, usePointLookup } from '~/lib/location/point_lookup'
import { SERVICE_CENTER } from '~/lib/location/service_area'
import { suggestNearby, useAddressSuggestions } from '~/lib/location/suggest'
import { useOrderStep, type OrderDraft, type PickupPoint } from '~/lib/order/draft'
import { phoneError } from '~/lib/shared/phone'

function validate(draft: OrderDraft) {
  const errors: Partial<Record<DetailsField, string>> = {}
  if (draft.name.trim().length < 2) errors.name = 'Isi nama Anda.'
  const phone = phoneError(draft.phone)
  if (phone) errors.phone = phone
  if (!draft.address.trim()) errors.address = 'Isi alamat penjemputan.'
  else if (draft.address.trim().length < 10)
    errors.address = 'Lengkapi alamat: nama jalan, nomor rumah, RT/RW.'
  return errors
}

export default function OrderDetails() {
  const { draft, update } = useOrderStep(0)
  const [submitted, setSubmitted] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const addressRef = useRef<HTMLTextAreaElement>(null)
  const mapRef = useRef<LocationMapHandle>(null)
  const [start] = useState(() => draft.point ?? SERVICE_CENTER)
  const [initial] = useState(() => ({
    key: draft.point ? addressKey(draft.address) : '',
    unplaced: draft.point ? '' : draft.address,
  }))
  const [point, setPoint] = useState<PickupPoint>(start)
  const [locating, setLocating] = useState(false)
  const suggestions = useAddressSuggestions(draft.address)
  const lookup = usePointLookup(point, draft.address.split(',')[0]?.trim())
  const move = useCallback((target: PickupPoint) => mapRef.current?.moveTo(target, 17), [])
  const { adopt, pick, follow } = useAddressPin(initial.key, move)
  const errors = submitted ? validate(draft) : {}
  const best =
    suggestions.mode === 'search' && !suggestions.loading ? suggestions.items[0]?.point : undefined

  useEffect(() => {
    if (initial.unplaced) void follow(initial.unplaced)
  }, [initial.unplaced, follow])

  async function locate() {
    setLocating(true)
    try {
      const here = await locateDevice()
      move(here)
      if (!draft.address.trim()) {
        const [nearest] = await suggestNearby(here).catch(() => [])
        if (nearest) {
          adopt(nearest.value)
          update({ address: nearest.value })
        }
      }
    } catch {
      toast.error('Lokasi tidak bisa dibaca. Izinkan akses lokasi atau geser peta.')
    } finally {
      setLocating(false)
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    const found = validate(draft)
    const first = (['name', 'phone', 'address'] as const).find((key) => found[key])
    if (first) {
      const refs = { name: nameRef, phone: phoneRef, address: addressRef }
      refs[first].current?.focus()
      return
    }
    if (await follow(draft.address, best)) {
      toast.info('Titik di peta disesuaikan dengan alamat Anda. Periksa, lalu tekan Lanjut.')
      return
    }
    if (lookup.tone === 'outside') {
      document.getElementById('pickup-point-title')?.scrollIntoView({ block: 'center' })
      return
    }
    update({ point, landmark: draft.landmark.trim() })
    router.visit(urlFor('order.items'))
  }

  return (
    <div className="min-h-screen bg-card">
      <Head title="Data Diri" />
      <FlowHeader title="Pesan Penjemputan" step={1} />
      <form onSubmit={submit} noValidate>
        <div className="mx-auto box-content max-w-page px-5">
          <StepProgress current={0} className="pt-3.5" />
          <div className="grid items-start gap-x-12 gap-y-7 pt-6.5 lg:grid-cols-2 lg:grid-rows-[auto_1fr]">
            <div className="flex flex-col gap-6 lg:col-start-1 lg:row-start-1">
              <div className="flex flex-col gap-1.5">
                <h1 className="text-[clamp(24px,calc(20px+0.6vw),30px)] leading-[1.2] font-bold tracking-[-0.015em]">
                  Data diri
                </h1>
                <p className="text-[14.5px] leading-normal text-foreground-secondary">
                  Kami pakai untuk menghubungi Anda dan menjemput barang di alamat Anda.
                </p>
              </div>
              <CustomerDetailsFields
                draft={draft}
                errors={errors}
                nameRef={nameRef}
                phoneRef={phoneRef}
                addressRef={addressRef}
                suggestions={suggestions}
                onChange={update}
                onAddressFocus={suggestions.locate}
                onAddressBlur={() => void follow(draft.address, best)}
                onAddressPick={(suggestion) => {
                  update({ address: suggestion.value })
                  pick(suggestion)
                }}
              />
            </div>
            <PickupPointPicker
              mapRef={mapRef}
              start={start}
              label={lookup.label}
              tone={lookup.tone}
              loading={lookup.loading}
              locating={locating}
              landmark={draft.landmark}
              onLocate={locate}
              onMoveEnd={setPoint}
              onLandmarkChange={(landmark) => update({ landmark })}
              className="lg:col-start-2 lg:row-span-2 lg:row-start-1"
            />
            <InfoNote
              icon={IconLock}
              tone="plain"
              size="sm"
              className="lg:col-start-1 lg:row-start-2"
            >
              Kami hanya meminta data yang diperlukan untuk penjemputan dan pengantaran.
            </InfoNote>
          </div>
        </div>
        <FlowFooter className="mt-4">
          <BackLink variant="footer" href={urlFor('home')} />
          <Button
            type="submit"
            size="cta"
            className="flex-1 sm:w-auto sm:min-w-74 sm:flex-none sm:px-7"
          >
            Lanjut
          </Button>
        </FlowFooter>
      </form>
    </div>
  )
}

OrderDetails.layout = [FlowLayout]
