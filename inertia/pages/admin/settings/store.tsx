import { useState, type SyntheticEvent, type ReactNode } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { IconDeviceFloppy } from '@tabler/icons-react'
import PhoneInput from '~/components/molecules/phone_input'
import OwnerPageHeader from '~/components/organisms/owner_page_header'
import ClosureCard from '~/components/organisms/settings/closure_card'
import OpeningHoursForm from '~/components/organisms/settings/opening_hours_form'
import SettingsNav from '~/components/organisms/settings/settings_nav'
import OwnerLayout from '~/components/templates/owner_layout'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Field, FieldDescription, FieldError, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import type { Data } from '@generated/data'

export type StoreInfo = NonNullable<Data.SharedProps['store']>

export default function AdminStoreSettings({ hours }: { hours: Data.OpeningHours }) {
  const sharedStore = usePage<Data.SharedProps>().props.store
  const pageErrors = usePage().props.errors ?? {}
  const [storeForm, setStoreForm] = useState<StoreInfo>({
    name: sharedStore?.name ?? 'Umima Clean',
    whatsapp: sharedStore?.whatsapp ?? '6285157900974',
    address: sharedStore?.address ?? '',
  })
  const [storeErrors, setStoreErrors] = useState<Record<string, string>>({})
  const [isSubmittingStore, setIsSubmittingStore] = useState(false)

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

  return (
    <>
      <Head title="Pengaturan Toko" />
      <OwnerPageHeader
        title="Pengaturan Toko"
        status="Kelola profil toko, jam operasional, dan tutup sementara."
      />

      <SettingsNav active="store">
        <div className="grid items-start gap-6 xl:grid-cols-5">
          <div className="flex min-w-0 flex-col gap-6 xl:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Profil toko</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleStoreSubmit} className="flex flex-col gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="store-name">Nama toko</FieldLabel>
                      <Input
                        id="store-name"
                        value={storeForm.name}
                        onChange={(e) =>
                          setStoreForm((prev) => ({ ...prev, name: e.target.value }))
                        }
                        placeholder="Contoh: Umima Clean"
                        className="h-11"
                        required
                      />
                      {activeStoreErrors.name && <FieldError>{activeStoreErrors.name}</FieldError>}
                    </Field>

                    <PhoneInput
                      id="store-whatsapp"
                      label="WhatsApp bisnis"
                      value={storeForm.whatsapp}
                      onChange={(val) => setStoreForm((prev) => ({ ...prev, whatsapp: val }))}
                      error={activeStoreErrors.whatsapp}
                      required
                    />
                  </div>

                  <Field>
                    <FieldLabel htmlFor="store-address">Alamat toko</FieldLabel>
                    <Textarea
                      id="store-address"
                      rows={2}
                      value={storeForm.address}
                      onChange={(e) =>
                        setStoreForm((prev) => ({ ...prev, address: e.target.value }))
                      }
                      placeholder="Alamat lengkap workshop / toko..."
                      required
                    />
                    <FieldDescription>
                      Ditampilkan di footer situs, halaman kebijakan privasi, dan nota pesanan.
                    </FieldDescription>
                    {activeStoreErrors.address && (
                      <FieldError>{activeStoreErrors.address}</FieldError>
                    )}
                  </Field>

                  <div>
                    <Button
                      type="submit"
                      isDisabled={isSubmittingStore}
                      className="w-full sm:w-auto"
                    >
                      <IconDeviceFloppy aria-hidden="true" className="mr-1.5 size-4" />
                      Simpan Profil Toko
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <OpeningHoursForm hours={hours} />
          </div>

          <div className="flex min-w-0 flex-col gap-6 xl:col-span-2">
            <ClosureCard hours={hours} />
          </div>
        </div>
      </SettingsNav>
    </>
  )
}

AdminStoreSettings.layout = (page: ReactNode) => (
  <OwnerLayout active="pengaturan" title="Pengaturan Toko">
    {page}
  </OwnerLayout>
)
