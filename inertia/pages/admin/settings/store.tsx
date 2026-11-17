import { useState, type SyntheticEvent, type ReactNode } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { IconClock, IconDeviceFloppy, IconInfoCircle } from '@tabler/icons-react'
import PhoneInput from '~/components/molecules/phone_input'
import OwnerPageHeader from '~/components/organisms/owner_page_header'
import OpeningHoursForm from '~/components/organisms/settings/opening_hours_form'
import SettingsTabs from '~/components/organisms/settings/settings_tabs'
import OwnerLayout from '~/components/templates/owner_layout'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Field, FieldDescription, FieldError, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { Switch } from '~/components/ui/switch'
import { Textarea } from '~/components/ui/textarea'
import type { Data } from '@generated/data'

export type StoreInfo = NonNullable<Data.SharedProps['store']>
export type PickupSlotItem = Data.PickupSlot

export default function AdminStoreSettings({
  slots,
  hours,
}: {
  slots: PickupSlotItem[]
  hours: Data.OpeningHours
}) {
  const sharedStore = usePage<Data.SharedProps>().props.store
  const pageErrors = usePage().props.errors ?? {}
  const [storeForm, setStoreForm] = useState<StoreInfo>({
    name: sharedStore?.name ?? 'Umima Clean',
    whatsapp: sharedStore?.whatsapp ?? '6285157900974',
    address: sharedStore?.address ?? '',
  })
  const [storeErrors, setStoreErrors] = useState<Record<string, string>>({})
  const [isSubmittingStore, setIsSubmittingStore] = useState(false)

  const [slotsState, setSlotsState] = useState<PickupSlotItem[]>(slots)
  const [slotsErrors, setSlotsErrors] = useState<Record<string, string>>({})
  const [isSubmittingSlots, setIsSubmittingSlots] = useState(false)

  const activeStoreErrors = { ...pageErrors, ...storeErrors }

  function handleStoreSubmit(e: SyntheticEvent) {
    e.preventDefault()
    setStoreErrors({})
    setIsSubmittingStore(true)

    router.put(
      '/admin/pengaturan/toko',
      { ...storeForm },
      {
        preserveScroll: true,
        onSuccess: () => {
          setIsSubmittingStore(false)
        },
        onError: (errs) => {
          setStoreErrors(errs)
          setIsSubmittingStore(false)
        },
        onFinish: () => {
          setIsSubmittingStore(false)
        },
      }
    )
  }

  function handleSlotCapacityChange(id: string, capacity: number) {
    setSlotsState((prev) =>
      prev.map((s) => (s.id === id ? { ...s, capacity: Math.max(1, Math.min(20, capacity)) } : s))
    )
  }

  function handleSlotToggle(id: string, isActive: boolean) {
    setSlotsState((prev) => prev.map((s) => (s.id === id ? { ...s, isActive } : s)))
  }

  function handleSlotsSubmit(e: SyntheticEvent) {
    e.preventDefault()
    setSlotsErrors({})
    setIsSubmittingSlots(true)

    router.put(
      '/admin/pengaturan/slot',
      { slots: slotsState },
      {
        preserveScroll: true,
        onSuccess: () => {
          setIsSubmittingSlots(false)
        },
        onError: (errs) => {
          setSlotsErrors(errs)
          setIsSubmittingSlots(false)
        },
        onFinish: () => {
          setIsSubmittingSlots(false)
        },
      }
    )
  }

  const activeSlotsCount = slotsState.filter((s) => s.isActive).length

  return (
    <>
      <Head title="Pengaturan Toko & Jadwal" />
      <OwnerPageHeader
        title="Pengaturan Toko & Jadwal"
        status="Kelola identitas toko, nomor kontak WhatsApp, alamat operasional, dan kapasitas slot penjemputan harian."
      />

      <SettingsTabs active="store" />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Informasi Toko */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <IconInfoCircle className="size-5 text-primary" />
              <CardTitle>Informasi Toko</CardTitle>
            </div>
            <CardDescription>
              Data ini ditampilkan di footer situs, halaman kebijakan privasi, dan nota pesanan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStoreSubmit} className="flex flex-col gap-4">
              <Field>
                <FieldLabel htmlFor="store-name">Nama Toko</FieldLabel>
                <Input
                  id="store-name"
                  value={storeForm.name}
                  onChange={(e) => setStoreForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Contoh: Umima Clean"
                  required
                />
                {activeStoreErrors.name && <FieldError>{activeStoreErrors.name}</FieldError>}
              </Field>

              <PhoneInput
                id="store-whatsapp"
                label="Nomor WhatsApp"
                description="Nomor resmi untuk konfirmasi pesanan dan kontak bantuan pelanggan."
                value={storeForm.whatsapp}
                onChange={(val) => setStoreForm((prev) => ({ ...prev, whatsapp: val }))}
                error={activeStoreErrors.whatsapp}
                required
              />

              <Field>
                <FieldLabel htmlFor="store-address">Alamat Operasional Toko</FieldLabel>
                <Textarea
                  id="store-address"
                  rows={3}
                  value={storeForm.address}
                  onChange={(e) => setStoreForm((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="Alamat lengkap workshop / toko..."
                  required
                />
                <FieldDescription>
                  Alamat workshop tempat operasional pencucian sepatu dan helm.
                </FieldDescription>
                {activeStoreErrors.address && <FieldError>{activeStoreErrors.address}</FieldError>}
              </Field>

              <div className="pt-2">
                <Button type="submit" isDisabled={isSubmittingStore} className="w-full sm:w-auto">
                  <IconDeviceFloppy className="mr-1.5 size-4" />
                  Simpan Informasi Toko
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <OpeningHoursForm hours={hours} />

        {/* Slot Penjemputan */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <IconClock className="size-5 text-primary" />
                <CardTitle>Slot Penjemputan</CardTitle>
              </div>
              <Badge variant="outline" className="text-xs">
                {activeSlotsCount} slot aktif
              </Badge>
            </div>
            <CardDescription>
              Tentukan jam penjemputan harian dan batas kuota pesanan per kurir (1–20 pasang/item).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSlotsSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
                {slotsState.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{slot.label}</span>
                        {!slot.isActive && (
                          <Badge variant="secondary" className="text-[10px]">
                            Nonaktif
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">ID: {slot.id}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor={`capacity-${slot.id}`}
                          className="text-xs font-medium text-muted-foreground whitespace-nowrap"
                        >
                          Kapasitas:
                        </label>
                        <Input
                          id={`capacity-${slot.id}`}
                          type="number"
                          min={1}
                          max={20}
                          value={slot.capacity}
                          onChange={(e) =>
                            handleSlotCapacityChange(slot.id, Number(e.target.value))
                          }
                          className="h-9 w-20 text-center"
                          aria-label={`Kapasitas slot ${slot.label}`}
                          required
                        />
                      </div>

                      <Switch
                        isSelected={slot.isActive}
                        onChange={(active) => handleSlotToggle(slot.id, active)}
                        aria-label={`Status aktif slot ${slot.label}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {slotsErrors.slots && <FieldError>{slotsErrors.slots}</FieldError>}

              <div className="pt-2">
                <Button type="submit" isDisabled={isSubmittingSlots} className="w-full sm:w-auto">
                  <IconDeviceFloppy className="mr-1.5 size-4" />
                  Simpan Jadwal Slot
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

AdminStoreSettings.layout = (page: ReactNode) => (
  <OwnerLayout active="pengaturan" title="Pengaturan Toko">
    {page}
  </OwnerLayout>
)
