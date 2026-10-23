import { useEffect, useState } from 'react'
import { Head } from '@inertiajs/react'
import { IconSearch, IconX } from '@tabler/icons-react'
import { Field, FieldDescription, FieldLabel } from '~/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '~/components/ui/input_group'
import { Switch } from '~/components/ui/switch'
import AdminPageHeader from '~/components/organisms/admin_page_header'
import SettingsPanel from '~/components/organisms/settings/settings_panel'
import SettingsTabs from '~/components/organisms/settings/settings_tabs'
import AdminLayout from '~/components/templates/admin_layout'
import {
  AREA_QUERY_MAX,
  BOUNDARY_CREDIT,
  groupByCity,
  type ServiceAreaRow,
} from '~/lib/location/service_area'
import { searchServiceAreas, setServiceAreaActive } from '~/lib/settings/service_areas'

export default function AdminServiceAreas({
  q,
  active,
  results,
}: {
  q: string
  active: ServiceAreaRow[]
  results: ServiceAreaRow[]
}) {
  const [query, setQuery] = useState(q)

  useEffect(() => {
    if (query.trim() === q) {
      return
    }
    const timer = window.setTimeout(() => searchServiceAreas(query.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [query, q])

  return (
    <AdminLayout active="pengaturan" title="Pengaturan">
      <Head title="Area layanan" />
      <AdminPageHeader title="Pengaturan" />
      <SettingsTabs active="areas" />
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <SettingsPanel
          title="Area aktif"
          aside={
            <span className="text-caption leading-none text-muted-foreground">
              {active.length} kecamatan
            </span>
          }
        >
          {active.length === 0 && (
            <p className="text-note leading-normal text-destructive-text">
              Belum ada kecamatan aktif. Pelanggan belum bisa memesan penjemputan.
            </p>
          )}
          {groupByCity(active).map(({ city, areas }) => (
            <div key={city} className="flex flex-col gap-2 border-t border-border pt-2.5">
              <h3 className="text-sm leading-[1.2] font-semibold">
                {city} · {areas.length}
              </h3>
              <ul className="flex flex-wrap gap-1.5">
                {areas.map((area) => (
                  <li
                    key={area.id}
                    className="box-content inline-flex h-8 items-center gap-0.5 rounded-pill border border-input bg-background pr-1 pl-2.75 text-meta leading-none font-medium"
                  >
                    {area.name}
                    <button
                      type="button"
                      aria-label={`Nonaktifkan Kec. ${area.name}, ${city}`}
                      onClick={() => setServiceAreaActive(area.id, false)}
                      className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
                    >
                      <IconX className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="text-note leading-normal text-foreground-secondary">
            Titik jemput dan antar di kecamatan aktif gratis ongkir. Menonaktifkan kecamatan hanya
            berlaku untuk alamat dan pesanan baru; pesanan yang sudah berjalan tidak berubah.
          </p>
        </SettingsPanel>
        <SettingsPanel title="Cari kecamatan">
          <Field>
            <FieldLabel htmlFor="area-search">Nama kecamatan atau kota</FieldLabel>
            <InputGroup className="h-input">
              <InputGroupInput
                id="area-search"
                type="search"
                autoComplete="off"
                placeholder="mis. Cileunyi atau Cimahi"
                maxLength={AREA_QUERY_MAX}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <InputGroupAddon>
                <IconSearch />
              </InputGroupAddon>
            </InputGroup>
            <FieldDescription className="text-caption leading-[1.4]">
              {BOUNDARY_CREDIT}
            </FieldDescription>
          </Field>
          {q && results.length === 0 && (
            <p role="status" className="text-note leading-normal text-muted-foreground">
              Tidak ada kecamatan yang cocok dengan “{q}”.
            </p>
          )}
          {results.length > 0 && (
            <ul aria-label="Hasil pencarian" className="flex flex-col">
              {results.map((area) => (
                <li
                  key={area.id}
                  className="flex min-h-11 items-center gap-2.5 border-t border-border py-2"
                >
                  <span className="flex flex-1 flex-col gap-0.5">
                    <span className="text-[14.5px] leading-[1.3] font-medium">
                      Kec. {area.name}
                    </span>
                    <span className="text-caption leading-[1.3] text-muted-foreground">
                      {area.city}
                    </span>
                  </span>
                  <Switch
                    isSelected={area.isActive}
                    onChange={(isActive) => setServiceAreaActive(area.id, isActive)}
                    aria-label={`Area layanan Kec. ${area.name}, ${area.city}`}
                  />
                </li>
              ))}
            </ul>
          )}
        </SettingsPanel>
      </div>
    </AdminLayout>
  )
}
