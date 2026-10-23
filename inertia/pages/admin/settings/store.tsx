import { useId, useState, type ComponentType, type SVGProps } from 'react'
import { Head } from '@inertiajs/react'
import { toast } from 'sonner'
import {
  IconCash,
  IconCreditCard,
  IconDeviceFloppy,
  IconMinus,
  IconPlus,
  IconQrcode,
} from '@tabler/icons-react'
import { Button } from '~/components/ui/button'
import { FieldDescription, FieldError } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Switch } from '~/components/ui/switch'
import ChoicePills from '~/components/molecules/choice_pills'
import AdminPageHeader from '~/components/organisms/admin_page_header'
import SettingsPanel from '~/components/organisms/settings/settings_panel'
import SettingsTabs from '~/components/organisms/settings/settings_tabs'
import AdminLayout from '~/components/templates/admin_layout'
import { THRESHOLDS } from '~/lib/customers/segments'
import {
  SLOT_CAPACITY,
  STORE_PAY_METHODS,
  saveStoreSettings,
  type StorePayKey,
  type StoreSettings,
} from '~/lib/settings/store_settings'

const PAY_ICONS: Record<StorePayKey, ComponentType<SVGProps<SVGSVGElement>>> = {
  qris: IconQrcode,
  cash: IconCash,
  edc: IconCreditCard,
}

function TextField({
  label,
  value,
  onChange,
  hint,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  hint?: string
  type?: 'text' | 'tel'
}) {
  const id = useId()
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label htmlFor={id} className="text-note leading-[1.2]">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        autoComplete="off"
        value={value}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="px-3"
      />
      {hint && (
        <FieldDescription id={`${id}-hint`} className="text-caption leading-[1.4]">
          {hint}
        </FieldDescription>
      )}
    </div>
  )
}

export default function AdminStoreSettings({
  settings: saved,
  isQrisAvailable,
}: {
  settings: StoreSettings
  isQrisAvailable: boolean
}) {
  const [draft, setDraft] = useState<StoreSettings>(saved)
  const [isSaving, setSaving] = useState(false)
  const [showPayWarning, setPayWarning] = useState(false)
  const update = (patch: Partial<StoreSettings>) =>
    setDraft((current) => ({ ...current, ...patch }))

  function togglePay(key: StorePayKey) {
    const next = { ...draft.payments, [key]: !draft.payments[key] }
    if (!next.qris && !next.cash && !next.edc) {
      setPayWarning(true)
      return
    }
    setPayWarning(false)
    update({ payments: next })
  }

  return (
    <AdminLayout active="pengaturan" title="Pengaturan">
      <Head title="Toko & pembayaran" />
      <AdminPageHeader
        title="Pengaturan"
        actions={
          <Button
            size="desktop"
            className="gap-1.5"
            isPending={isSaving}
            onPress={() => {
              setSaving(true)
              saveStoreSettings(draft, {
                onError: (errors) =>
                  toast.error(Object.values(errors)[0] ?? 'Periksa kembali isian.'),
                onFinish: () => setSaving(false),
              })
            }}
          >
            <IconDeviceFloppy className="size-4.5" />
            {isSaving ? 'Menyimpan…' : 'Simpan perubahan'}
          </Button>
        }
      />
      <SettingsTabs active="store" />
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          <SettingsPanel title="Profil toko">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <TextField
                label="Nama toko"
                value={draft.name}
                onChange={(name) => update({ name })}
              />
              <TextField
                label="WhatsApp bisnis"
                type="tel"
                value={draft.whatsapp}
                onChange={(whatsapp) => update({ whatsapp })}
              />
              <TextField
                label="Alamat toko"
                value={draft.address}
                onChange={(address) => update({ address })}
              />
              <TextField
                label="Jam buka"
                value={draft.hours}
                onChange={(hours) => update({ hours })}
                hint="Ditampilkan di struk dan pesan WhatsApp."
              />
            </div>
          </SettingsPanel>
          <SettingsPanel title="Slot penjemputan">
            {draft.slots.map((slot, index) => {
              const setSlot = (patch: Partial<typeof slot>) =>
                update({
                  slots: draft.slots.map((item, position) =>
                    position === index ? { ...item, ...patch } : item
                  ),
                })
              return (
                <div
                  key={slot.label}
                  className="flex flex-wrap items-center gap-2.5 border-t border-border pt-2.5"
                >
                  <Switch
                    isSelected={slot.on}
                    onChange={(isOn) => setSlot({ on: isOn })}
                    aria-label={`Aktifkan slot ${slot.label}`}
                  />
                  <span className="flex-1 font-mono text-[14.5px] leading-[1.2] font-semibold">
                    {slot.label}
                  </span>
                  <span className="text-meta leading-none text-foreground-secondary">
                    kapasitas
                  </span>
                  <span
                    role="group"
                    aria-label={`Kapasitas ${slot.label}`}
                    className="inline-flex items-center overflow-hidden rounded-md border border-input"
                  >
                    <button
                      type="button"
                      aria-label={`Kurangi kapasitas ${slot.label}`}
                      disabled={slot.capacity <= SLOT_CAPACITY.min}
                      onClick={() =>
                        setSlot({ capacity: Math.max(SLOT_CAPACITY.min, slot.capacity - 1) })
                      }
                      className="flex size-11 items-center justify-center bg-card hover:bg-accent disabled:text-disabled-foreground"
                    >
                      <IconMinus className="size-5" />
                    </button>
                    <output
                      aria-live="polite"
                      className="min-w-8.5 text-center text-[15px] leading-none font-semibold"
                    >
                      {slot.capacity}
                    </output>
                    <button
                      type="button"
                      aria-label={`Tambah kapasitas ${slot.label}`}
                      disabled={slot.capacity >= SLOT_CAPACITY.max}
                      onClick={() =>
                        setSlot({ capacity: Math.min(SLOT_CAPACITY.max, slot.capacity + 1) })
                      }
                      className="flex size-11 items-center justify-center bg-card hover:bg-accent disabled:text-disabled-foreground"
                    >
                      <IconPlus className="size-5" />
                    </button>
                  </span>
                </div>
              )
            })}
            <p className="text-note leading-normal text-foreground-secondary">
              Kapasitas = jumlah penjemputan per slot per hari. Slot penuh tetap terlihat tapi tidak
              bisa dipilih pelanggan; slot nonaktif disembunyikan.
            </p>
          </SettingsPanel>
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <SettingsPanel title="Pembayaran">
            <div className="flex items-center gap-2.5 rounded-md bg-accent p-3">
              <IconQrcode className="size-6 shrink-0 text-info-foreground" />
              <span className="flex-1">
                <span className="block text-[14.5px] leading-[1.3] font-semibold">
                  {isQrisAvailable
                    ? 'QRIS online · Midtrans terhubung'
                    : 'QRIS online · belum aktif'}
                </span>
                <span className="block text-caption leading-[1.35] text-foreground-secondary">
                  {isQrisAvailable
                    ? 'Satu-satunya metode untuk pesanan online'
                    : 'Isi MIDTRANS_SERVER_KEY di server agar pelanggan bisa membayar QRIS'}
                </span>
              </span>
            </div>
            <h3 className="text-meta leading-none font-semibold tracking-wider text-muted-foreground uppercase">
              Metode di toko
            </h3>
            {STORE_PAY_METHODS.map((method) => {
              const Icon = PAY_ICONS[method.key]
              return (
                <div key={method.key} className="flex min-h-11 items-center gap-2.5">
                  <Icon className="size-5 text-foreground-secondary" />
                  <span className="flex-1 text-[14.5px] leading-[1.3] font-medium">
                    {method.label}
                  </span>
                  <Switch
                    isSelected={draft.payments[method.key]}
                    onChange={() => togglePay(method.key)}
                    aria-label={`Aktifkan ${method.label}`}
                  />
                </div>
              )
            })}
            {showPayWarning && (
              <FieldError className="text-meta">Minimal satu metode toko harus aktif.</FieldError>
            )}
          </SettingsPanel>
          <SettingsPanel title="Pelanggan tidak aktif">
            <p className="text-note leading-normal text-foreground-secondary">
              Batas bawaan yang dipakai di halaman Pelanggan. Owner tetap bisa mengubahnya sementara
              di sana.
            </p>
            <ChoicePills
              label="Batas hari"
              value={draft.inactiveDays}
              onChange={(inactiveDays) => update({ inactiveDays })}
              options={THRESHOLDS.map((days) => ({ value: days, label: `${days} hari` }))}
            />
          </SettingsPanel>
        </div>
      </div>
    </AdminLayout>
  )
}
