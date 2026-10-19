import { useState, type ComponentType } from 'react'
import { IconBuildingStore, IconInfoCircle, IconMoped } from '@tabler/icons-react'
import { Alert } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import TabList from '~/components/molecules/tab_list'
import {
  BAG_MATERIALS,
  BAG_PRICES,
  COLOR_PRICES,
  HELMET_PRICES,
  PRICE_TABS,
  SHOE_PRICES,
  SHOE_SURCHARGES,
  type PriceEntry,
  type PriceTab,
} from '~/lib/catalog/price_list'
import { formatRupiah } from '~/lib/shared/format'
import { cn } from '~/lib/shared/utils'

function PriceRow({ entry }: { entry: PriceEntry }) {
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] content-start gap-x-4 gap-y-1 border-b border-border py-3.5">
      <span className="text-base leading-[1.3] font-semibold">{entry.name}</span>

      <span className="text-right text-base leading-[1.3] font-semibold whitespace-nowrap tabular-nums">
        {entry.from && (
          <span className="text-caption leading-none font-medium text-muted-foreground">
            mulai{' '}
          </span>
        )}
        {formatRupiah(entry.price)}
      </span>

      {entry.description && (
        <p className="col-span-full text-sm leading-normal text-pretty text-foreground-secondary">
          {entry.description}
        </p>
      )}

      {entry.dropOff && (
        <Badge
          variant="attention"
          className="col-span-full h-6.5 gap-1.25 justify-self-start px-2.25"
        >
          <IconBuildingStore />
          Antar langsung ke workshop
        </Badge>
      )}
    </li>
  )
}

function ShoePrices() {
  return (
    <ul className="grid gap-x-10 lg:grid-cols-2">
      {SHOE_PRICES.map((entry) => (
        <PriceRow key={entry.name} entry={entry} />
      ))}
      <li className="mt-3.5 flex flex-col gap-2 self-start rounded-md bg-background px-4 py-3.5">
        <h3 className="text-md font-semibold">Biaya tambahan</h3>

        <dl className="flex flex-col gap-2">
          {SHOE_SURCHARGES.map((surcharge) => (
            <div
              key={surcharge.name}
              className="flex justify-between gap-3 text-[14.5px] leading-[1.4]"
            >
              <dt>{surcharge.name}</dt>

              <dd className="font-semibold whitespace-nowrap tabular-nums">
                +{formatRupiah(surcharge.price)}
              </dd>
            </div>
          ))}
        </dl>
      </li>
    </ul>
  )
}

function BagAndHelmetPrices() {
  const head =
    'px-3.5 py-2.5 text-right text-meta leading-[1.3] font-semibold text-foreground-secondary'

  return (
    <div className="grid items-start gap-x-10 gap-y-6 lg:grid-cols-2">
      <div className="flex flex-col gap-2.5">
        <h3 className="text-base leading-[1.3] font-semibold">Tas</h3>

        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-background">
                <th scope="col" className={cn(head, 'text-left')}>
                  Ukuran
                </th>
                {BAG_MATERIALS.map((material) => (
                  <th key={material} scope="col" className={head}>
                    {material}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {BAG_PRICES.map((row) => (
                <tr key={row.size} className="border-t border-border">
                  <th
                    scope="row"
                    className="px-3.5 py-3 text-left text-md leading-[1.3] font-semibold"
                  >
                    {row.size}
                    <span className="mt-0.5 block text-meta leading-[1.3] font-normal text-muted-foreground">
                      {row.limit}
                    </span>
                  </th>

                  {row.prices.map((price, index) => (
                    <td
                      key={BAG_MATERIALS[index]}
                      className="px-3.5 py-3 text-right text-md leading-[1.3] font-medium tabular-nums"
                    >
                      {formatRupiah(price)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col">
        <h3 className="border-b border-border pb-2.5 text-base leading-[1.3] font-semibold">
          Helm
        </h3>

        <ul>
          {HELMET_PRICES.map((entry) => (
            <PriceRow key={entry.name} entry={entry} />
          ))}
        </ul>
      </div>
    </div>
  )
}

function ColorPrices() {
  return (
    <ul className="grid gap-x-10 lg:grid-cols-2">
      {COLOR_PRICES.map((entry) => (
        <PriceRow key={entry.name} entry={entry} />
      ))}
    </ul>
  )
}

const PANELS: Record<PriceTab, ComponentType> = {
  sepatu: ShoePrices,
  tas: BagAndHelmetPrices,
  warna: ColorPrices,
}

export default function PriceListSection() {
  const [tab, setTab] = useState<PriceTab>('sepatu')
  const Panel = PANELS[tab]

  return (
    <section
      id="harga"
      aria-labelledby="harga-heading"
      className="mx-auto box-content flex max-w-page flex-col gap-4 px-5 pt-10 pb-2"
    >
      <div className="flex flex-col gap-2">
        <h2 id="harga-heading" className="text-title">
          Daftar harga
        </h2>

        <p className="max-w-160 text-md leading-[1.55] text-pretty text-foreground-secondary">
          Gambaran biaya setiap layanan, supaya Anda tahu kisarannya sebelum memesan.
        </p>
      </div>

      <Alert variant="info" role="note" className="font-medium">
        <IconInfoCircle className="mt-px" />
        <span>
          Harga acuan. Anda tidak perlu memilih layanan: tim kami memeriksa setiap barang, lalu
          menentukan layanan dan harga akhirnya. Tagihan dikirim via WhatsApp sebelum pencucian
          dimulai.
        </span>
      </Alert>

      <TabList
        label="Kategori layanan"
        tabs={PRICE_TABS}
        value={tab}
        onChange={setTab}
        idPrefix="harga-tab"
        panelId="harga-panel"
        tabClassName="px-3.5 text-md leading-none"
      />

      <div id="harga-panel" role="tabpanel" aria-labelledby={`harga-tab-${tab}`}>
        <Panel />
      </div>

      <p className="flex items-start gap-2 text-note leading-normal text-muted-foreground">
        <IconMoped className="my-[0.9px] size-4.5 shrink-0" />
        <span>
          Semua layanan bisa dengan antar-jemput, kecuali Helmet Spa yang perlu diantar langsung ke
          workshop.
        </span>
      </p>
    </section>
  )
}
