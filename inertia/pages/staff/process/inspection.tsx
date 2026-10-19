import { Head } from '@inertiajs/react'
import { IconClipboardCheck } from '@tabler/icons-react'
import { urlFor } from '~/client'
import SourceTag from '~/components/atoms/source_tag'
import ToneBadge from '~/components/atoms/tone_badge'
import BarSteps from '~/components/molecules/bar_steps'
import DemoSwitcher from '~/components/organisms/demo_switcher'
import BillSummaryCard from '~/components/organisms/processing/bill_summary_card'
import InspectionItemCard from '~/components/organisms/processing/inspection_item_card'
import StaffMissingOrder from '~/components/organisms/staff_missing_order'
import StaffTopBar from '~/components/organisms/staff_top_bar'
import StaffLayout from '~/components/templates/staff_layout'
import {
  INSPECTION_FLOW,
  chooseBase,
  inspectionState,
  inspectionSummary,
  reopenInspection,
  saveInspection,
  setItemNote,
  toggleAddOn,
} from '~/lib/processing/inspection'
import { findInspectionOrder } from '~/lib/processing/orders'
import { formatRupiah } from '~/lib/shared/format'
import { useWorkday } from '~/lib/staff/workday'

export default function Inspection({ number }: { number: string }) {
  const day = useWorkday()
  const order = findInspectionOrder(day, number)
  const back = { href: urlFor('staff.process'), label: 'Kembali ke antrean Proses' }

  if (!order) {
    return (
      <StaffLayout active="proses">
        <Head title="Pemeriksaan & layanan" />
        <StaffTopBar title="Pemeriksaan & layanan" subtitle={number} back={back} variant="detail" />
        <StaffMissingOrder number={number} backHref={back.href} backLabel={back.label} />
      </StaffLayout>
    )
  }

  const state = inspectionState(day, order)
  const summary = inspectionSummary(order, state)
  const store = order.source === 'toko'
  const total = formatRupiah(summary.total)
  const savedText = store
    ? `Tersimpan · total ${total}. Lanjutkan ke pembayaran di kasir: QRIS, tunai, atau EDC.`
    : `Tersimpan · total ${total}. Sistem mengirim tagihan QRIS ke WhatsApp ${order.customer} dan pengingat otomatis bila belum dibayar. Pesanan masuk Dalam Pencucian setelah lunas.`
  const next = store
    ? { href: urlFor('staff.store_payment', { number }), label: 'Lanjut ke Pembayaran di Kasir' }
    : back

  return (
    <StaffLayout active="proses">
      <Head title={`Pemeriksaan ${number}`} />
      <StaffTopBar
        title="Pemeriksaan & layanan"
        subtitle={number}
        back={back}
        variant="detail"
        actions={
          <>
            <SourceTag store={store} shape="pill" className="max-sm:hidden" />
            <ToneBadge tone={summary.saved ? 'ok' : 'periksa'} className="h-6.5 px-2.5">
              {summary.saved ? 'Tersimpan' : 'Periksa barang'}
            </ToneBadge>
          </>
        }
      />
      <div className="mx-auto flex w-full max-w-page flex-col gap-3.5 p-4">
        <BarSteps
          label="Tahap proses"
          steps={INSPECTION_FLOW}
          current={summary.saved ? 5 : 2}
          currentClassName="bg-status-periksa-dot"
          className="grid-cols-5"
        />
        <div className="flex flex-col gap-x-5 gap-y-3.5 lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
          <div className="flex min-w-0 flex-col gap-3.5">
            <dl className="grid grid-cols-1 gap-x-6 rounded-lg border border-border bg-card px-4 py-1 sm:grid-cols-2">
              {[
                ['Pelanggan', `${order.customer} · ${order.phone}`],
                ['Diterima', order.received],
                [
                  'Jumlah barang',
                  <>
                    {order.itemCount} barang{' '}
                    <span className="font-normal text-muted-foreground">
                      (perkiraan pelanggan: {order.estimate})
                    </span>
                  </>,
                ],
                [
                  'Catatan pelanggan',
                  <span key="note" className="font-normal">
                    {order.customerNote ? `“${order.customerNote}”` : '—'}
                  </span>,
                ],
              ].map(([label, value]) => (
                <div key={String(label)} className="flex flex-col gap-0.5 py-2.5">
                  <dt className="text-caption leading-[1.3] font-medium text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="text-[14.5px] leading-[1.4] font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="flex gap-2 rounded-md bg-status-periksa-bg px-3 py-2.5 text-note leading-[1.45] text-status-periksa-fg">
              <IconClipboardCheck className="mt-0.5 size-4.5 shrink-0" />
              Periksa setiap barang, tulis kondisinya, lalu pilih layanan. Pelanggan tidak memilih
              layanan saat memesan.
            </p>
            {summary.items.map((item) => (
              <InspectionItemCard
                key={item.id}
                label={item.label}
                title={item.title}
                category={item.category}
                note={item.note}
                selection={item.selection}
                catalog={item.catalog}
                missing={item.missing}
                subtotal={item.subtotal}
                locked={summary.saved}
                onNote={(note) => setItemNote(order, item.id, note)}
                onBase={(name) => chooseBase(order, item.id, name)}
                onAddOn={(name) => toggleAddOn(order, item.id, name)}
              />
            ))}
          </div>
          <BillSummaryCard
            rows={summary.items.map((item) => ({
              key: item.id,
              title: `${item.label} · ${item.title}`,
              subtotal: item.subtotal,
              services: item.servicesText,
            }))}
            total={summary.total}
            missing={summary.missing}
            saved={summary.saved}
            savedText={savedText}
            next={next}
            onSave={() => saveInspection(order)}
          />
        </div>
      </div>
      <DemoSwitcher
        className="max-sm:bottom-19 sm:right-3 sm:left-auto"
        label="Data contoh pemeriksaan"
        options={[
          { value: 'keep', label: summary.saved ? 'Tersimpan' : 'Belum disimpan' },
          { value: 'reset', label: 'Periksa ulang' },
        ]}
        value="keep"
        onChange={(value) => {
          if (value === 'reset') reopenInspection(order)
        }}
      />
    </StaffLayout>
  )
}
