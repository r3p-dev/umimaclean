import { useMemo, useState, type ReactNode } from 'react'
import { Head, router } from '@inertiajs/react'
import { IconMapPin, IconSearch } from '@tabler/icons-react'
import { cn } from 'cn'
import OwnerPageHeader from '~/components/organisms/owner_page_header'
import ServiceAreaMap from '~/components/organisms/service_area_map'
import SettingsTabs from '~/components/organisms/settings/settings_tabs'
import OwnerLayout from '~/components/templates/owner_layout'
import { Badge } from '~/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Switch } from '~/components/ui/switch'
import type { Data } from '@generated/data'

export type ServiceAreaItem = Data.ServiceArea
export type ServiceAreaCity = Data.ServiceArea['city']

const CITY_ORDER: ServiceAreaCity[] = ['Kota Bandung', 'Kota Cimahi', 'Kabupaten Bandung']

export default function AdminAreas({
  areas,
  shapes,
  tilesUrl,
  devWarning,
}: {
  areas: ServiceAreaItem[]
  shapes: Data.ServiceAreaShape[]
  tilesUrl: string | null
  devWarning: string | null
}) {
  const [search, setSearch] = useState('')

  const activeTotal = useMemo(() => areas.filter((a) => a.isActive).length, [areas])

  const filteredAreas = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return areas
    return areas.filter((a) => a.name.toLowerCase().includes(q))
  }, [areas, search])

  const grouped = useMemo(() => {
    const map = new Map<ServiceAreaCity, ServiceAreaItem[]>()
    for (const city of CITY_ORDER) {
      map.set(city, [])
    }
    for (const area of filteredAreas) {
      const list = map.get(area.city) ?? []
      list.push(area)
      map.set(area.city, list)
    }
    return map
  }, [filteredAreas])

  function handleToggle(district: ServiceAreaItem) {
    router.patch(
      `/admin/pengaturan/area/${district.id}/toggle`,
      { isActive: !district.isActive },
      { preserveScroll: true }
    )
  }

  return (
    <>
      <Head title="Area Layanan" />
      <OwnerPageHeader
        title="Area Layanan"
        status="Atur kecamatan yang dijangkau oleh kurir jemput-antar. Perubahan langsung berlaku ke pemeriksaan jangkauan."
      />

      <SettingsTabs active="areas" />

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kecamatan..."
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1 text-sm font-medium">
              <IconMapPin className="mr-1.5 size-3.5 text-primary" />
              {activeTotal} dari {areas.length} kecamatan aktif
            </Badge>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Peta area</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <ServiceAreaMap
              shapes={shapes}
              tilesUrl={tilesUrl}
              devWarning={devWarning}
              className="h-80 lg:h-96"
            />
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="size-4 rounded-sm border-2 border-primary bg-primary/20" />
                Aktif
              </li>
              <li className="flex items-center gap-2">
                <span className="size-4 rounded-sm border-2 border-dashed border-muted-foreground" />
                Nonaktif
              </li>
            </ul>
          </CardContent>
        </Card>

        {filteredAreas.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <IconSearch className="mb-2 size-8 text-muted-foreground/50" />
              <p className="text-sm font-medium">
                Tidak ada kecamatan yang cocok dengan pencarian.
              </p>
            </CardContent>
          </Card>
        ) : (
          CITY_ORDER.map((city) => {
            const list = grouped.get(city) ?? []
            if (list.length === 0) return null

            const allForCity = areas.filter((a) => a.city === city)
            const activeForCity = allForCity.filter((a) => a.isActive).length

            return (
              <Card key={city}>
                <CardHeader className="border-b border-border pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-base font-semibold">{city}</CardTitle>
                      <CardDescription className="text-xs">
                        {list.length} kecamatan ditampilkan
                      </CardDescription>
                    </div>
                    <Badge
                      variant={activeForCity === allForCity.length ? 'default' : 'secondary'}
                      className="text-xs font-medium"
                    >
                      {activeForCity} / {allForCity.length} aktif
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                    {list.map((district) => (
                      <div
                        key={district.id}
                        className={cn(
                          'flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors',
                          district.isActive
                            ? 'border-border bg-card text-card-foreground shadow-2xs'
                            : 'border-dashed border-border/80 bg-muted/30 text-muted-foreground'
                        )}
                      >
                        <div className="flex min-w-0 flex-col">
                          <span
                            className={cn(
                              'truncate text-sm font-medium',
                              district.isActive ? 'text-foreground' : 'text-muted-foreground'
                            )}
                          >
                            {district.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Kode: {district.code}
                          </span>
                        </div>
                        <Switch
                          isSelected={district.isActive}
                          onChange={() => handleToggle(district)}
                          aria-label={`Status jangkauan kecamatan ${district.name}`}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </>
  )
}

AdminAreas.layout = (page: ReactNode) => (
  <OwnerLayout active="area" title="Area Layanan">
    {page}
  </OwnerLayout>
)
