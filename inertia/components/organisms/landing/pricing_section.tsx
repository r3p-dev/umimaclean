import { useMemo, useState } from 'react'
import { IconAlertCircle, IconClock, IconInfoCircle } from '@tabler/icons-react'
import { cn } from 'cn'
import { Badge } from '~/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { ItemKind, ItemKindLabel } from '#enums/item_kind_enum'
import { ServiceType } from '#enums/service_type_enum'
import type { Data } from '@generated/data'
import { formatRupiah } from '~/lib/format'

export type PricingService = Data.Service

export default function PricingSection({ services }: { services: PricingService[] }) {
  const [selectedKind, setSelectedKind] = useState<'all' | ItemKind>('all')

  const activeServices = useMemo(() => {
    return services.filter((s) => s.isActive)
  }, [services])

  const filteredServices = useMemo(() => {
    if (selectedKind === 'all') return activeServices
    return activeServices.filter((s) => s.itemKinds.includes(selectedKind))
  }, [activeServices, selectedKind])

  const mainServices = useMemo(() => {
    return filteredServices.filter((s) => s.type === ServiceType.MAIN)
  }, [filteredServices])

  const addonServices = useMemo(() => {
    return filteredServices.filter((s) => s.type === ServiceType.ADDON)
  }, [filteredServices])

  return (
    <section id="harga" aria-labelledby="pricing-heading" className="bg-background py-16 sm:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5">
        <div className="flex flex-col gap-3 text-center sm:text-left">
          <Badge variant="outline" className="w-fit self-center sm:self-start">
            Transparan & Jelas
          </Badge>
          <h2
            id="pricing-heading"
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            Daftar Layanan & Harga
          </h2>
          <p className="max-w-2xl text-base text-muted-foreground">
            Gambaran estimasi biaya setiap layanan. Anda tidak perlu bingung memilih layanan saat
            memesan: kurir kami menjemput dan tim ahli kami memeriksa barang Anda untuk rekomendasi
            layanan terbaik.
          </p>
        </div>

        {/* Informative Callout */}
        <div
          role="note"
          aria-label="Catatan penetapan harga"
          className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground"
        >
          <IconInfoCircle className="mt-0.5 size-5 shrink-0 text-primary" />
          <p className="leading-relaxed">
            <strong className="font-semibold text-foreground">Harga Acuan Transparan:</strong> Semua
            harga di bawah adalah patokan baku. Sebelum pengerjaan dimulai, kami mengirimkan rincian
            kondisi barang dan total tagihan resmi via WhatsApp untuk Anda setujui terlebih dahulu.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedKind('all')}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
              selectedKind === 'all'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            Semua Layanan ({activeServices.length})
          </button>
          {[ItemKind.SHOE, ItemKind.BAG, ItemKind.HELMET].map((kind) => {
            const count = activeServices.filter((s) => s.itemKinds.includes(kind)).length
            return (
              <button
                key={kind}
                type="button"
                onClick={() => setSelectedKind(kind)}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                  selectedKind === kind
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                {ItemKindLabel[kind]} ({count})
              </button>
            )
          })}
        </div>

        {/* Helmet Store-Only Notice (SVC-4) */}
        {(selectedKind === 'all' || selectedKind === ItemKind.HELMET) && (
          <div
            role="note"
            aria-label="Informasi layanan helm"
            className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-3.5 text-sm text-muted-foreground"
          >
            <IconAlertCircle className="size-5 shrink-0 text-amber-600" />
            <p>
              <strong className="font-medium text-foreground">Khusus Bawa Langsung ke Toko:</strong>{' '}
              Layanan pencucian helm (Helmet Spa) hanya dilayani melalui drop-off langsung ke
              workshop kami dan tidak mencakup layanan antar-jemput.
            </p>
          </div>
        )}

        {/* Main Services Grid */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">Layanan Utama</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mainServices.map((service) => (
              <Card key={service.id} className="flex h-full flex-col justify-between">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-bold">{service.name}</CardTitle>
                    <div className="flex flex-col items-end">
                      <span className="text-base font-bold text-primary">
                        {formatRupiah(service.price)}
                      </span>
                      {service.isStartingFrom && (
                        <span className="text-[11px] font-medium text-muted-foreground">
                          mulai dari
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {service.itemKinds.map((kind) => (
                      <Badge key={kind} variant="secondary" className="text-[11px]">
                        {ItemKindLabel[kind]}
                      </Badge>
                    ))}
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <IconClock className="size-3.5" />
                      {service.estimatedDays > 0 ? `${service.estimatedDays} hari` : 'Langsung'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed text-foreground/80">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Addon Services */}
        {addonServices.length > 0 && (
          <div className="flex flex-col gap-4 pt-4">
            <h3 className="text-lg font-semibold tracking-tight text-foreground">
              Layanan Tambahan (Add-on)
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {addonServices.map((service) => (
                <div
                  key={service.id}
                  className="flex flex-col justify-between gap-2 rounded-xl border border-border bg-card p-4 shadow-xs"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-semibold text-foreground">{service.name}</span>
                      <span className="text-sm font-bold text-primary">
                        +{service.isStartingFrom ? 'mulai ' : ''}
                        {formatRupiah(service.price)}
                      </span>
                    </div>
                    {service.description && (
                      <p className="text-xs text-muted-foreground">{service.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    {service.itemKinds.map((kind) => (
                      <Badge key={kind} variant="outline" className="text-[10px]">
                        {ItemKindLabel[kind]}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
