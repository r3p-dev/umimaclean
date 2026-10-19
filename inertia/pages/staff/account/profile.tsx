import { useId, useState, type ReactNode } from 'react'
import { Head } from '@inertiajs/react'
import { toast } from 'sonner'
import { IconDeviceMobile, IconDevices, IconLock, IconLogout } from '@tabler/icons-react'
import { urlFor } from '~/client'
import { Button, LinkButton } from '~/components/ui/button'
import { FieldDescription, FieldError } from '~/components/ui/field'
import InitialsAvatar from '~/components/atoms/initials_avatar'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Switch } from '~/components/ui/switch'
import ToneBadge from '~/components/atoms/tone_badge'
import ChoicePills from '~/components/molecules/choice_pills'
import StaffTopBar from '~/components/organisms/staff_top_bar'
import StaffLayout from '~/components/templates/staff_layout'
import {
  MAP_APPS,
  NOTIFICATIONS,
  passwordErrors,
  preferences,
  type PasswordForm,
} from '~/lib/staff/preferences'
import { STAFF_PROFILE } from '~/lib/staff/profile'
import { cn } from '~/lib/shared/utils'

function Panel({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="flex min-w-0 flex-col gap-3 rounded-lg border border-border bg-card px-4.5 py-4">
      {title && <h2 className="text-[17px] leading-[1.25] font-bold">{title}</h2>}
      {children}
    </section>
  )
}

function PasswordField({
  label,
  value,
  error,
  hint,
  onChange,
}: {
  label: string
  value: string
  error?: string
  hint?: string
  onChange: (value: string) => void
}) {
  const id = useId()
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label htmlFor={id} className="text-note leading-[1.2]">
        {label}
      </Label>
      <Input
        id={id}
        type="password"
        autoComplete="off"
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${id}-note` : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="px-3"
      />
      {hint && !error && (
        <FieldDescription id={`${id}-note`} className="text-caption">
          {hint}
        </FieldDescription>
      )}
      {error && (
        <FieldError id={`${id}-note`} className="text-meta">
          {error}
        </FieldError>
      )}
    </div>
  )
}

const EMPTY: PasswordForm = { current: '', next: '', confirm: '' }

export default function StaffProfile() {
  const prefs = preferences.use()
  const [form, setForm] = useState<PasswordForm>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof PasswordForm, string>>>({})

  function savePassword() {
    const found = passwordErrors(form)
    setErrors(found)
    if (Object.keys(found).length) return
    setForm(EMPTY)
    toast.success('Kata sandi diperbarui. Perangkat lain perlu masuk ulang.')
  }

  const rows = [
    ['Nomor WhatsApp', STAFF_PROFILE.phone, true],
    ['Email / pengguna', STAFF_PROFILE.email, false],
    ['Bergabung', STAFF_PROFILE.joined, false],
  ] as const

  return (
    <StaffLayout active="lainnya">
      <Head title="Profil & Pengaturan" />
      <StaffTopBar
        title="Profil & Pengaturan"
        back={{ href: urlFor('staff.more'), label: 'Kembali' }}
      />
      <div className="mx-auto flex w-full max-w-190 flex-col gap-3.5 p-4">
        <div className="grid grid-cols-1 items-start gap-3.5 sm:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-3.5">
            <Panel>
              <div className="flex items-center gap-3.5">
                <InitialsAvatar initials={STAFF_PROFILE.initials} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="text-lg leading-[1.25] font-bold">{STAFF_PROFILE.name}</p>
                  <p className="text-note leading-[1.4] text-foreground-secondary">
                    {STAFF_PROFILE.role} · {STAFF_PROFILE.shift}
                  </p>
                </div>
              </div>
              <dl className="flex flex-col gap-3">
                {rows.map(([label, value, mono]) => (
                  <div
                    key={label}
                    className="flex justify-between gap-3 border-t border-border pt-2 text-sm leading-[1.4]"
                  >
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className={cn('text-right', mono && 'font-mono')}>{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="flex items-start gap-2 text-caption leading-[1.45] text-muted-foreground">
                <IconLock className="size-4 shrink-0" />
                Nama, peran, dan shift diatur owner di Pengaturan.
              </p>
            </Panel>
            <Panel title="Notifikasi">
              {NOTIFICATIONS.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center gap-3 border-t border-border pt-2.5"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14.5px] leading-[1.3] font-semibold">
                      {item.label}
                    </span>
                    <span className="block text-caption leading-[1.4] text-muted-foreground">
                      {item.description}
                    </span>
                  </span>
                  <Switch
                    aria-label={item.label}
                    isSelected={prefs.notifications[item.key]}
                    onChange={(checked) =>
                      preferences.set((current) => ({
                        ...current,
                        notifications: { ...current.notifications, [item.key]: checked },
                      }))
                    }
                  />
                </div>
              ))}
            </Panel>
            <Panel title="Navigasi">
              <p className="text-note leading-normal text-foreground-secondary">
                Aplikasi yang dibuka dari tombol “Buka di Google Maps” saat rute bawaan tidak
                tersedia.
              </p>
              <ChoicePills
                label="Aplikasi peta"
                options={MAP_APPS.map((app) => ({ value: app, label: app }))}
                value={prefs.mapApp}
                onChange={(app) => preferences.set((current) => ({ ...current, mapApp: app }))}
              />
            </Panel>
          </div>
          <div className="flex min-w-0 flex-col gap-3.5">
            <Panel title="Ubah kata sandi">
              <PasswordField
                label="Kata sandi saat ini"
                value={form.current}
                error={errors.current}
                onChange={(current) => setForm({ ...form, current })}
              />
              <PasswordField
                label="Kata sandi baru"
                value={form.next}
                error={errors.next}
                hint="Minimal 8 karakter."
                onChange={(next) => setForm({ ...form, next })}
              />
              <PasswordField
                label="Ulangi kata sandi baru"
                value={form.confirm}
                error={errors.confirm}
                onChange={(confirm) => setForm({ ...form, confirm })}
              />
              <div>
                <Button size="desktop" onPress={savePassword}>
                  Simpan kata sandi
                </Button>
              </div>
            </Panel>
            <Panel title="Perangkat & sesi">
              <div className="flex items-center gap-2.5">
                <IconDeviceMobile className="size-5.5 text-foreground-secondary" />
                <span className="flex-1">
                  <span className="block text-[14.5px] leading-[1.3] font-semibold">
                    Perangkat ini
                  </span>
                  <span className="block text-caption leading-[1.4] text-muted-foreground">
                    Aktif sekarang
                  </span>
                </span>
                <ToneBadge tone="ok">Aktif</ToneBadge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="desktop"
                  onPress={() => toast.success('Semua perangkat lain sudah dikeluarkan.')}
                >
                  <IconDevices className="size-4.5" />
                  Keluar dari perangkat lain
                </Button>
                <LinkButton
                  variant="destructive-outline"
                  size="desktop"
                  className="h-11.5"
                  href={urlFor('home')}
                >
                  <IconLogout className="size-4.5" />
                  Keluar
                </LinkButton>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </StaffLayout>
  )
}
