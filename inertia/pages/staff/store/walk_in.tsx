import { useEffect, useState } from 'react'
import { Head, router } from '@inertiajs/react'
import {
  IconArrowRight,
  IconBackpack,
  IconBuildingStore,
  IconHelmet,
  IconShoe,
} from '@tabler/icons-react'
import { urlFor } from '~/client'
import { Button } from '~/components/ui/button'
import QuantityStepper from '~/components/molecules/quantity_stepper'
import StaffTopBar from '~/components/organisms/staff_top_bar'
import ReturnMethodCard from '~/components/organisms/store/return_method_card'
import WalkInCustomer from '~/components/organisms/store/walk_in_customer'
import StaffLayout from '~/components/templates/staff_layout'
import { usePointLookup } from '~/lib/location/point_lookup'
import { itemsSummary } from '~/lib/order/items'
import {
  WALK_IN_STEPS,
  lookupCustomer,
  sanitizePhone,
  updateWalkInForm,
  walkInBlocker,
  walkInForm,
  walkInPayload,
  type CustomerLookup,
} from '~/lib/store/walk_in'
import { cn } from '~/lib/shared/utils'

const COUNTERS = [
  { key: 'sepatu', label: 'Sepatu', icon: IconShoe },
  { key: 'tas', label: 'Tas', icon: IconBackpack },
  { key: 'helm', label: 'Helm', icon: IconHelmet },
] as const

export default function WalkIn({ lookup: found }: { lookup: CustomerLookup }) {
  const form = walkInForm.use()
  const { phone, name, isPicked, items, returnMethod, shouldUseSaved, point, typedAddress } = form
  const [isBusy, setBusy] = useState(false)
  const lookup = lookupCustomer(phone, found)
  const customer = isPicked ? lookup.match : null

  useEffect(() => {
    if (!lookup.key || lookup.isChecked) {
      return
    }
    const timer = window.setTimeout(() => {
      router.reload({ data: { nomor: lookup.key }, only: ['lookup'] })
    }, 300)
    return () => window.clearTimeout(timer)
  }, [lookup.key, lookup.isChecked])
  const pointLookup = usePointLookup(point)
  const pointAddress = pointLookup.label
    ? [pointLookup.label.street, pointLookup.label.area].filter(Boolean).join(', ')
    : ''
  const address = typedAddress ?? pointAddress
  const isDelivery = returnMethod === 'antar'
  const useSaved = !!customer?.address && shouldUseSaved
  const draft = { phone, name, customer, items, returnMethod, useSaved, address, point }
  const blocker = walkInBlocker(draft, found)

  const customerText = customer
    ? `${customer.name} · terdaftar`
    : lookup.complete && !lookup.match && name.trim()
      ? `${name.trim()} · disimpan baru`
      : '—'
  const returnText = !isDelivery
    ? 'Diambil di toko'
    : useSaved
      ? `Diantar · ${customer?.area ?? 'alamat utama'}`
      : `Diantar · ${address.split(',')[0] || 'pilih titik di peta'}`

  function submit() {
    if (blocker || isBusy) {
      return
    }
    router.post(urlFor('staff.walk_in.store'), walkInPayload(draft), {
      onStart: () => setBusy(true),
      onSuccess: () => walkInForm.reset(),
      onFinish: () => setBusy(false),
    })
  }

  return (
    <StaffLayout active="lainnya">
      <Head title="Transaksi Offline" />
      <StaffTopBar
        title="Transaksi Offline"
        back={{ href: urlFor('staff.more'), label: 'Kembali ke Lainnya' }}
        variant="detail"
        actions={
          <span
            data-surface="inverse"
            className="inline-flex h-6.5 items-center gap-1.25 rounded-pill bg-surface-inverse px-2.5 text-[11.5px] leading-none font-bold tracking-[0.04em] text-surface-inverse-foreground"
          >
            <IconBuildingStore className="size-3.75" />
            OFFLINE · TOKO
          </span>
        }
      />
      <div className="mx-auto flex w-full max-w-260 flex-col gap-3.5 p-4">
        <ol
          aria-label="Alur transaksi di toko"
          className="flex flex-wrap items-center gap-1.5 text-caption leading-[1.3] font-medium"
        >
          {WALK_IN_STEPS.map((step, index) => (
            <li key={step.label} className="contents">
              {index > 0 && (
                <span aria-hidden="true" className="text-muted-foreground">
                  ›
                </span>
              )}
              <span
                className={cn(
                  step.done ? 'font-semibold text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </li>
          ))}
        </ol>
        <div className="flex flex-col gap-x-5 gap-y-3.5 lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
          <div className="flex min-w-0 flex-col gap-3.5">
            <WalkInCustomer
              phone={phone}
              name={name}
              isComplete={lookup.complete}
              match={lookup.match}
              isPicked={isPicked}
              onPhone={(value) =>
                updateWalkInForm({ phone: sanitizePhone(value), isPicked: false })
              }
              onName={(value) => updateWalkInForm({ name: value })}
              onPick={() => updateWalkInForm({ isPicked: true, shouldUseSaved: true })}
              onUnpick={() => updateWalkInForm({ isPicked: false })}
            />
            <section className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
              <h2 className="mb-1 text-base leading-[1.3] font-semibold">
                2 · Barang diterima di toko
              </h2>
              {COUNTERS.map((counter) => (
                <QuantityStepper
                  key={counter.key}
                  label={counter.label}
                  icon={counter.icon}
                  value={items[counter.key]}
                  onChange={(value) =>
                    updateWalkInForm({ items: { ...items, [counter.key]: value } })
                  }
                  className="min-h-14 last:border-b"
                  labelClassName="gap-2.5 text-[15.5px] [&_svg]:size-5.5"
                />
              ))}
              <p className="mt-2 text-caption leading-[1.45] text-muted-foreground">
                Setelah transaksi dibuat, kamera terbuka untuk memotret kondisi barang.
              </p>
            </section>
          </div>
          <div className="flex min-w-0 flex-col gap-3.5">
            <ReturnMethodCard
              value={returnMethod}
              onChange={(value) => updateWalkInForm({ returnMethod: value })}
              savedArea={customer?.address ? (customer.area ?? 'Alamat utama') : null}
              shouldUseSaved={shouldUseSaved}
              onChoosePoint={() => updateWalkInForm({ shouldUseSaved: false })}
              point={point}
              address={address}
              onPoint={(next) => updateWalkInForm({ point: next, typedAddress: null })}
              onAddress={(value) => updateWalkInForm({ typedAddress: value })}
              tone={pointLookup.tone}
              isAreaLoading={pointLookup.loading}
            />
            <section className="flex flex-col gap-2.5 rounded-lg border border-border bg-card p-4">
              <h2 className="text-base leading-[1.3] font-semibold">Ringkasan</h2>
              <dl className="flex flex-col text-sm leading-[1.4]">
                {[
                  ['Pelanggan', customerText],
                  ['Barang', itemsSummary(items)],
                  ['Pengembalian', returnText],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between gap-3 border-b border-border py-2.25 last:border-b-0"
                  >
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="text-right font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
              <Button
                size="cta"
                isDisabled={Boolean(blocker)}
                isPending={isBusy}
                onPress={submit}
                aria-describedby={blocker ? 'walk-in-blocker' : undefined}
                className={cn('text-[15.5px]', blocker && 'h-13')}
              >
                Buat Transaksi &amp; Foto Barang
                {!blocker && <IconArrowRight />}
              </Button>
              {blocker && (
                <span
                  id="walk-in-blocker"
                  className="text-meta leading-[1.4] font-medium text-destructive-text"
                >
                  {blocker}
                </span>
              )}
              <p className="text-caption leading-normal text-muted-foreground">
                Layanan dan harga ditentukan saat pemeriksaan. Setelah itu pelanggan membayar di
                kasir dengan QRIS, tunai, atau EDC.
              </p>
            </section>
          </div>
        </div>
      </div>
    </StaffLayout>
  )
}
