import { useId, useState } from 'react'
import { Button } from '~/components/ui/button'
import { Dialog, DialogClose, DialogDescription } from '~/components/ui/dialog'
import { FieldDescription, FieldError } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import ChoicePills from '~/components/molecules/choice_pills'
import DialogTitleBar from '~/components/molecules/dialog_title_bar'
import { RoleLabel } from '@enums/role_enum'
import { STAFF_ROLES, staffFormErrors, type StaffForm } from '~/lib/settings/staff_accounts'

const FOOTER = 'flex flex-col-reverse justify-end gap-2 sm:flex-row sm:items-center'

export function StaffFormDialog({
  isOpen,
  onOpenChange,
  isEditing,
  initial,
  onSave,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  isEditing: boolean
  initial: StaffForm
  onSave: (form: StaffForm) => void
}) {
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({})
  const nameId = useId()
  const phoneId = useId()
  const roleId = useId()

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} variant="panel">
      <DialogTitleBar>{isEditing ? 'Ubah akun staf' : 'Tambah staf'}</DialogTitleBar>
      <div className="flex min-w-0 flex-col gap-1.5">
        <Label htmlFor={nameId} className="text-note leading-[1.2]">
          Nama lengkap
        </Label>
        <Input
          id={nameId}
          autoComplete="off"
          placeholder="mis. Dedi Supriadi"
          value={form.name}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? `${nameId}-error` : undefined}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          className="px-3"
        />
        {errors.name && (
          <FieldError id={`${nameId}-error`} className="text-meta">
            {errors.name}
          </FieldError>
        )}
      </div>
      <div className="flex min-w-0 flex-col gap-1.5">
        <Label htmlFor={phoneId} className="text-note leading-[1.2]">
          Nomor WhatsApp
        </Label>
        <Input
          id={phoneId}
          type="tel"
          inputMode="numeric"
          autoComplete="off"
          placeholder="0812xxxxxxxx"
          value={form.phone}
          aria-invalid={errors.phone ? true : undefined}
          aria-describedby={`${phoneId}-note`}
          onChange={(event) =>
            setForm({ ...form, phone: event.target.value.replace(/[^\d\- ]/g, '').slice(0, 16) })
          }
          className="px-3"
        />
        {errors.phone ? (
          <FieldError id={`${phoneId}-note`} className="text-meta">
            {errors.phone}
          </FieldError>
        ) : (
          <FieldDescription id={`${phoneId}-note`} className="text-caption leading-[1.4]">
            Setelah disimpan, kata sandi sementara ditampilkan sekali.
          </FieldDescription>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <span id={roleId} className="text-note leading-[1.2] font-semibold">
          Peran
        </span>
        <ChoicePills
          labelledBy={roleId}
          value={form.role}
          onChange={(role) => setForm({ ...form, role })}
          options={STAFF_ROLES.map((role) => ({ value: role, label: RoleLabel[role] }))}
        />
        <FieldDescription className="text-caption leading-[1.4]">
          Peran menentukan halaman awal dan akses. Owner bisa melihat laporan &amp; pengaturan.
        </FieldDescription>
      </div>
      <div className={FOOTER}>
        <DialogClose variant="outline" size="desktop">
          Batal
        </DialogClose>
        <Button
          size="desktop"
          onPress={() => {
            const found = staffFormErrors(form)
            setErrors(found)
            if (!Object.keys(found).length) {
              onSave(form)
            }
          }}
        >
          {isEditing ? 'Simpan perubahan' : 'Tambah & kirim undangan'}
        </Button>
      </div>
    </Dialog>
  )
}

export function DeactivateStaffDialog({
  isOpen,
  onOpenChange,
  name,
  onConfirm,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  name: string
  onConfirm: () => void
}) {
  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} variant="panel">
      <DialogTitleBar>Nonaktifkan {name}?</DialogTitleBar>
      <DialogDescription className="text-note leading-normal">
        Akses masuk dicabut segera dan tugas aktif dikembalikan ke antrean. Riwayat tugas dan log
        aktivitas tetap tersimpan. Akun bisa diaktifkan lagi kapan saja.
      </DialogDescription>
      <div className={FOOTER}>
        <DialogClose variant="outline" size="desktop">
          Batal
        </DialogClose>
        <Button variant="destructive" size="desktop" onPress={onConfirm}>
          Nonaktifkan akun
        </Button>
      </div>
    </Dialog>
  )
}
