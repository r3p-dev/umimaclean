import { useMemo } from 'react'
import { Head, router } from '@inertiajs/react'
import { IconInfoCircle } from '@tabler/icons-react'
import { urlFor } from '~/client'
import BackLink from '~/components/molecules/back_link'
import StepProgress from '~/components/molecules/step_progress'
import FlowFooter from '~/components/organisms/flow_footer'
import FlowHeader from '~/components/organisms/flow_header'
import ItemCounterList from '~/components/organisms/order/item_counter_list'
import PickupSchedulePicker from '~/components/organisms/order/pickup_schedule_picker'
import FlowLayout from '~/components/templates/flow_layout'
import { Alert } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import { Field, FieldLabel } from '~/components/ui/field'
import { Textarea } from '~/components/ui/textarea'
import { useOrderStep } from '~/lib/order/draft'
import { itemsSummary, totalItems } from '~/lib/order/items'
import { firstOpenSlot, formatSchedule, pickupDays, type PickupDay } from '~/lib/order/schedule'

export default function OrderItems() {
  const { draft, update, blocked } = useOrderStep(1)
  const days = useMemo(() => pickupDays(), [])
  const day =
    days.find((option) => option.available && option.iso === draft.date) ??
    days.find((option) => option.available)!
  const slot =
    draft.slot !== null && !day.fullSlots.includes(draft.slot) ? draft.slot : firstOpenSlot(day)
  const total = totalItems(draft.items)

  function pickDay(next: PickupDay) {
    update({ date: next.iso, slot: next.fullSlots.includes(slot) ? firstOpenSlot(next) : slot })
  }

  function proceed() {
    update({ date: day.iso, slot })
    router.visit(urlFor('order.confirm'))
  }

  if (blocked) return null

  return (
    <div className="min-h-screen bg-card">
      <Head title="Barang & Jadwal" />
      <FlowHeader title="Barang & Jadwal" step={2} />
      <div className="mx-auto box-content max-w-page px-5">
        <StepProgress current={1} className="pt-3.5" />
        <div className="grid items-start gap-x-12 lg:grid-cols-2">
          <div>
            <div className="flex flex-col gap-1 pt-6">
              <h1 className="text-[22px] leading-tight font-bold tracking-[-0.015em]">
                Apa yang akan dijemput?
              </h1>
              <p className="text-[14.5px] leading-normal text-foreground-secondary">
                Perkiraan jumlah saja. Kurir mencatat jumlah pasti saat menjemput.
              </p>
            </div>
            <ItemCounterList items={draft.items} onChange={(items) => update({ items })} />
            <Alert variant="info" role="note" className="mt-3 p-3.5 text-accent-foreground">
              <IconInfoCircle className="text-info-foreground" />
              <p>
                <strong className="font-semibold">Anda tidak perlu memilih layanan.</strong> Tim
                kami memeriksa setiap barang, lalu menentukan layanan dan harganya. Tagihan dikirim
                sebelum pencucian dimulai.
              </p>
            </Alert>
            <Field className="pt-5.5">
              <FieldLabel htmlFor="order-note" className="gap-1">
                Catatan <span className="font-normal text-muted-foreground">(opsional)</span>
              </FieldLabel>
              <Textarea
                id="order-note"
                rows={3}
                placeholder="mis. sepatu putih ada noda kopi di bagian depan"
                className="min-h-18 p-3.5"
                value={draft.note}
                onChange={(event) => update({ note: event.target.value.slice(0, 300) })}
              />
            </Field>
          </div>
          <PickupSchedulePicker
            days={days}
            day={day}
            slot={slot}
            onPickDay={pickDay}
            onPickSlot={(index) => update({ date: day.iso, slot: index })}
          />
        </div>
      </div>
      <FlowFooter
        className="mt-6"
        innerClassName="flex-col items-stretch sm:flex-row sm:items-center"
      >
        <p className="flex justify-between gap-4 text-note leading-[1.3] text-foreground-secondary sm:order-2 sm:flex-1 sm:justify-end">
          <span>{total ? itemsSummary(draft.items) : 'Tambah minimal 1 barang'}</span>
          <span>{formatSchedule(day.iso, slot, 'short')}</span>
        </p>
        <div className="flex gap-2.5 sm:contents">
          <BackLink variant="footer" href={urlFor('order.details')} className="sm:order-1" />
          <Button
            size="cta"
            isDisabled={total === 0}
            onPress={proceed}
            className="flex-1 sm:order-3 sm:w-auto sm:min-w-74 sm:flex-none sm:px-7"
          >
            Lanjut
          </Button>
        </div>
      </FlowFooter>
    </div>
  )
}

OrderItems.layout = [FlowLayout]
