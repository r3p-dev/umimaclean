import type { Data } from '@generated/data'
import { urlFor } from '~/client'
import { SlipDivider, SlipRow, SlipStamp, SlipStore } from '~/components/organisms/print/slip'
import PrintLayout from '~/components/templates/print_layout'
import type { Store } from '~/lib/print/sheet'

export default function IntakeSlip({ slip, store }: { slip: Data.IntakeSlip; store: Store }) {
  return (
    <PrintLayout
      title={`Tanda terima ${slip.number}`}
      backHref={urlFor('staff.inspection', { id: slip.id })}
    >
      <SlipStore store={store} />
      <SlipDivider />
      {slip.isCancelled && <SlipStamp>DIBATALKAN</SlipStamp>}
      <p className="text-center font-bold">TANDA TERIMA</p>
      <h1 className="text-center font-slip-mono text-[24px] leading-[1.1] font-bold">
        {slip.number}
      </h1>
      <p className="text-center">Diterima {slip.receivedAt}</p>
      {slip.staff && <p className="text-center">oleh {slip.staff}</p>}
      <SlipDivider />
      <p className="font-bold">{slip.customer}</p>
      {slip.phone && <p className="tabular-nums">{slip.phone}</p>}
      <SlipDivider />
      {slip.items.map((line) => (
        <p key={line}>{line}</p>
      ))}
      <SlipRow label="Jumlah barang" isStrong>
        {slip.itemCount}
      </SlipRow>
      {slip.note && <p>Catatan: {slip.note}</p>}
      <SlipDivider />
      {slip.delivery ? (
        <>
          <p className="font-bold">Pengembalian: Diantar</p>
          <p>Penerima: {slip.delivery.recipient}</p>
          <p>{slip.delivery.address}</p>
          {slip.delivery.landmark && <p>Patokan: {slip.delivery.landmark}</p>}
        </>
      ) : (
        <p className="font-bold">Pengembalian: Ambil di toko</p>
      )}
      <SlipDivider />
      <p>Harga akhir dikonfirmasi setelah barang diperiksa dan dikirim lewat WhatsApp.</p>
      <p className="mt-1">Lacak pesanan:</p>
      <p className="font-slip-mono">{slip.link}</p>
    </PrintLayout>
  )
}
