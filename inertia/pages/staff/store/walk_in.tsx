import { Head, router } from '@inertiajs/react'
import {
  IconArrowRight,
  IconBackpack,
  IconBuildingStore,
  IconCamera,
  IconHelmet,
  IconShoe,
} from '@tabler/icons-react'
import { urlFor } from '~/client'
import { Button, LinkButton } from '~/components/ui/button'
import QuantityStepper from '~/components/molecules/quantity_stepper'
import StaffTopBar from '~/components/organisms/staff_top_bar'
import ReturnMethodCard from '~/components/organisms/store/return_method_card'
import WalkInCustomer from '~/components/organisms/store/walk_in_customer'
import StaffLayout from '~/components/templates/staff_layout'
import { usePointLookup } from '~/lib/location/point_lookup'
import { itemsSummary } from '~/lib/order/items'
import {
  WALK_IN_STEPS,
  createWalkIn,
  lookupCustomer,
  sanitizePhone,
  updateWalkInForm,
  walkInBlocker,
  walkInForm,
} from '~/lib/store/walk_in'
import { cn } from '~/lib/shared/utils'

const COUNTERS = [
  { key: 'sepatu', label: 'Sepatu', icon: IconShoe },
  { key: 'tas', label: 'Tas', icon: IconBackpack },
  { key: 'helm', label: 'Helm', icon: IconHelmet },
] as const

export default function WalkIn() {
  const form = walkInForm.use()
  const { phone, name, picked, items, returnMethod, useSaved, point, typedAddress } = form
  const lookup = lookupCustomer(phone)
  const customer = picked ? lookup.match : null
  const pointLookup = usePointLookup(point)
  const pointAddress = pointLookup.label
    ? [pointLookup.label.street, pointLookup.label.area].filter(Boolean).join(', ')
    : ''
  const address = typedAddress ?? pointAddress
  const delivery = returnMethod === 'antar'
  const blocker = walkInBlocker({
    phone,
    name,
    customer,
    items,
    returnMethod,
    address,
    point: customer && useSaved ? null : point,
  })

  const customerText = customer
    ? `${customer.name} · terdaftar`
    : lookup.complete && !lookup.match && name.trim()
      ? `${name.trim()} · disimpan baru`
      : '—'
  const returnText = !delivery
    ? 'Diambil di toko'
    : customer && useSaved
      ? `Diantar · ${customer.area}`
      : `Diantar · ${address.split(',')[0] || 'pilih titik di peta'}`

  function submit() {
    if (blocker) return
    const number = createWalkIn({
      phone,
      name,
      customer,
      items,
      returnMethod,
      address,
      point: customer && useSaved ? null : point,
    })
    walkInForm.reset()
    router.visit(urlFor('staff.inspection', { number }))
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
              complete={lookup.complete}
              match={lookup.match}
              picked={picked}
              onPhone={(value) => updateWalkInForm({ phone: sanitizePhone(value), picked: false })}
              onName={(value) => updateWalkInForm({ name: value })}
              onPick={() => updateWalkInForm({ picked: true, useSaved: true })}
              onUnpick={() => updateWalkInForm({ picked: false })}
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
              <LinkButton
                variant="ghost"
                className="mt-2 h-12.5 border-[1.5px] border-input text-[15px] text-info-foreground hover:text-info-foreground"
                href={`${urlFor('staff.photo')}?untuk=intake`}
              >
                <IconCamera />
                {form.photos ? `Foto Barang · ${form.photos} tersimpan` : 'Foto Barang (Kamera)'}
              </LinkButton>
              <p className="text-caption leading-[1.45] text-muted-foreground">
                Foto kondisi barang saat diterima di toko. Kamera saja, tanpa galeri.
              </p>
            </section>
          </div>
          <div className="flex min-w-0 flex-col gap-3.5">
            <ReturnMethodCard
              value={returnMethod}
              onChange={(value) => updateWalkInForm({ returnMethod: value })}
              savedArea={customer?.area ?? null}
              useSaved={useSaved}
              onChoosePoint={() => updateWalkInForm({ useSaved: false })}
              point={point}
              address={address}
              onPoint={(next) => updateWalkInForm({ point: next, typedAddress: null })}
              onAddress={(value) => updateWalkInForm({ typedAddress: value })}
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
                onPress={submit}
                aria-describedby={blocker ? 'walk-in-blocker' : undefined}
                className={cn('text-[15.5px]', blocker && 'h-13')}
              >
                Buat Transaksi &amp; Periksa Barang
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
