import { useState } from 'react'
import { IconBuildingStore } from '@tabler/icons-react'
import type { Key } from 'react-aria-components'
import type { Data } from '@generated/data'
import Note from '~/components/atoms/note'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { formatRupiah } from '~/lib/format'
import { ItemKind, ItemKindLabel, ServiceType, ServiceTypeLabel } from '~/lib/service_enums'

export type PricingService = Data.Service

const KIND_ORDER = [ItemKind.SHOE, ItemKind.BAG, ItemKind.HELMET]

function MainServiceRow({ service }: { service: PricingService }) {
  return (
    <li className="flex flex-col gap-1 border-b border-border py-4">
      <div className="flex items-baseline justify-between gap-4">
        <span className="min-w-0 font-semibold text-foreground">{service.name}</span>
        <span className="shrink-0 font-semibold whitespace-nowrap text-foreground tabular-nums">
          {service.isStartingFrom && (
            <span className="text-sm font-normal text-muted-foreground">mulai dari </span>
          )}
          {formatRupiah(service.price)}
        </span>
      </div>
      {service.description && (
        <p className="text-sm text-pretty text-muted-foreground">{service.description}</p>
      )}
      {service.estimatedDays > 0 && (
        <p className="text-sm text-muted-foreground">Estimasi {service.estimatedDays} hari kerja</p>
      )}
    </li>
  )
}

function AddonCard({ addons }: { addons: PricingService[] }) {
  return (
    <li className="pt-4">
      <Card>
        <CardHeader>
          <CardTitle>
            <h3>{ServiceTypeLabel[ServiceType.ADDON]}</h3>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="flex flex-col gap-3">
            {addons.map((addon) => (
              <div key={addon.id} className="flex flex-wrap items-baseline gap-x-4 gap-y-0.5">
                <dt className="min-w-0 flex-1 text-foreground">{addon.name}</dt>
                <dd className="shrink-0 font-semibold whitespace-nowrap text-foreground tabular-nums">
                  +{addon.isStartingFrom ? 'mulai dari ' : ''}
                  {formatRupiah(addon.price)}
                </dd>
                {addon.description && (
                  <dd className="basis-full text-sm text-pretty text-muted-foreground">
                    {addon.description}
                  </dd>
                )}
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </li>
  )
}

export default function PricingSection({ services }: { services: PricingService[] }) {
  const groups = KIND_ORDER.map((kind) => {
    const ofKind = services.filter((service) => service.itemKinds.includes(kind))
    return {
      kind,
      hasStartingFromPrice: ofKind.some((service) => service.isStartingFrom),
      main: ofKind.filter((service) => service.type === ServiceType.MAIN),
      addons: ofKind.filter((service) => service.type === ServiceType.ADDON),
    }
  }).filter((group) => group.main.length > 0)

  const [selectedKind, setSelectedKind] = useState<Key | undefined>(groups[0]?.kind)

  return (
    <section id="harga" aria-labelledby="pricing-heading" className="bg-background py-16 sm:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5">
        <h2
          id="pricing-heading"
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
        >
          Daftar Layanan & Harga
        </h2>

        {groups.length > 0 ? (
          <Tabs selectedKey={selectedKind} onSelectionChange={setSelectedKind} className="gap-4">
            <TabsList
              variant="line"
              aria-label="Jenis barang"
              className="group-data-horizontal/tabs:h-11"
            >
              {groups.map((group) => (
                <TabsTrigger
                  key={group.kind}
                  id={group.kind}
                  className="px-4 text-base text-muted-foreground"
                >
                  {ItemKindLabel[group.kind]}
                </TabsTrigger>
              ))}
            </TabsList>

            {groups.map((group) => (
              <TabsContent
                key={group.kind}
                id={group.kind}
                className="flex flex-col gap-2 text-base"
              >
                {group.kind === ItemKind.HELMET && (
                  <Note tone="info" icon={<IconBuildingStore className="size-5 shrink-0" />}>
                    Khusus bawa langsung ke toko: helm tidak bisa dijemput.
                  </Note>
                )}
                <ul className="grid gap-x-10 lg:grid-cols-2">
                  {group.main.map((service) => (
                    <MainServiceRow key={service.id} service={service} />
                  ))}
                  {group.addons.length > 0 && <AddonCard addons={group.addons} />}
                </ul>
                {group.hasStartingFromPrice && (
                  <p className="pt-2 text-sm text-muted-foreground">
                    Harga bertanda “mulai dari” dipastikan setelah barang diperiksa.
                  </p>
                )}
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <p className="text-muted-foreground">Daftar harga belum tersedia.</p>
        )}
      </div>
    </section>
  )
}
