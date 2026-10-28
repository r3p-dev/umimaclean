import type { Data } from '@generated/data'
import { urlFor } from '~/client'
import { SlipDivider, SlipRow, SlipStamp } from '~/components/organisms/print/slip'
import PrintLayout from '~/components/templates/print_layout'
import type { Store } from '~/lib/print/sheet'
import { formatRupiah } from '~/lib/shared/format'

export default function DeliveryLabel({
  label,
  store,
}: {
  label: Data.DeliveryLabel
  store: Store
}) {
  return (
    <PrintLayout title={`Label antar ${label.number}`} backHref={urlFor('staff.deliveries')}>
      <h1 className="text-center font-slip-mono text-[30px] leading-none font-bold">
        {label.number}
      </h1>
      <SlipDivider />
      <p>Penerima</p>
      <p className="text-[15px] font-bold">{label.recipient}</p>
      {label.phone && <p className="text-[14px] font-bold tabular-nums">{label.phone}</p>}
      <p>{label.address}</p>
      {label.landmark && <p>Patokan: {label.landmark}</p>}
      <SlipDivider />
      <SlipRow label="Jumlah barang" isStrong>
        {label.itemCount}
      </SlipRow>
      {label.items.map((name, index) => (
        <p key={`${name}-${index}`}>· {name}</p>
      ))}
      <SlipStamp>
        {label.isPaid ? (
          'LUNAS'
        ) : (
          <>
            BELUM LUNAS · <span className="whitespace-nowrap">{formatRupiah(label.due)}</span>
          </>
        )}
      </SlipStamp>
      <SlipDivider />
      <p className="text-center font-bold">{store.name}</p>
      <p className="text-center">WA {store.whatsapp}</p>
    </PrintLayout>
  )
}
