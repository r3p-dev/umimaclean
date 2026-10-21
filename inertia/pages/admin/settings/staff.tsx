import { useState } from 'react'
import { Head } from '@inertiajs/react'
import { toast } from 'sonner'
import { IconPencil, IconUserPlus } from '@tabler/icons-react'
import { Button } from '~/components/ui/button'
import InitialsAvatar from '~/components/atoms/initials_avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import ToneBadge from '~/components/atoms/tone_badge'
import AdminPageHeader from '~/components/organisms/admin_page_header'
import { TABLE_HEAD_ROW } from '~/components/organisms/data_table/table_parts'
import SettingsTabs from '~/components/organisms/settings/settings_tabs'
import {
  DeactivateStaffDialog,
  StaffFormDialog,
} from '~/components/organisms/settings/staff_dialogs'
import AdminLayout from '~/components/templates/admin_layout'
import { Dialog, DialogClose, DialogDescription } from '~/components/ui/dialog'
import DialogTitleBar from '~/components/molecules/dialog_title_bar'
import {
  EMPTY_STAFF_FORM,
  initialsOf,
  resetStaffPassword,
  saveStaff,
  setStaffActive,
  type StaffAccount,
  type StaffForm,
} from '~/lib/settings/staff_accounts'
import { cn } from '~/lib/shared/utils'

type DialogState =
  { kind: 'form'; id: string | null; initial: StaffForm } | { kind: 'off'; id: string } | null

type PasswordNotice = { name: string; password: string; notice: string }

export default function AdminStaffSettings({
  accounts,
  password,
}: {
  accounts: StaffAccount[]
  password: PasswordNotice | null
}) {
  const [dialog, setDialog] = useState<DialogState>(null)
  const [shownPassword, setShownPassword] = useState<PasswordNotice | null>(password)
  const [seenPassword, setSeenPassword] = useState(password)
  if (password !== seenPassword) {
    setSeenPassword(password)
    setShownPassword(password)
  }
  const onError = (errors: Record<string, string>) =>
    toast.error(Object.values(errors)[0] ?? 'Periksa kembali isian.')
  const active = accounts.filter((account) => account.active).length
  const deactivating =
    dialog?.kind === 'off' ? accounts.find((item) => item.id === dialog.id) : null

  function toggle(account: StaffAccount) {
    if (account.active) {
      setDialog({ kind: 'off', id: account.id })
      return
    }
    setStaffActive(account.id, true)
  }

  function actions(account: StaffAccount) {
    const isDestructive = account.active
    return (
      <div className="flex justify-end gap-1.5">
        <Button
          variant="outline"
          size="icon"
          aria-label={`Ubah ${account.name}`}
          onPress={() =>
            setDialog({
              kind: 'form',
              id: account.id,
              initial: {
                name: account.name,
                phone: account.phone,
                role: account.role,
                shift: account.shift,
              },
            })
          }
        >
          <IconPencil className="size-4.5" />
        </Button>
        {!account.isSelf && (
          <>
            <Button
              variant="outline"
              size="compact"
              onPress={() => resetStaffPassword(account.id)}
              className="rounded-[9px] text-meta"
            >
              Reset sandi
            </Button>
            <Button
              variant="outline"
              size="compact"
              onPress={() => toggle(account)}
              className={cn('rounded-[9px] text-meta', isDestructive && 'text-destructive-text')}
            >
              {account.active ? 'Nonaktifkan' : 'Aktifkan'}
            </Button>
          </>
        )}
      </div>
    )
  }

  return (
    <AdminLayout active="pengaturan" title="Pengaturan">
      <Head title="Akun staf" />
      <AdminPageHeader
        title="Pengaturan"
        actions={
          <Button
            size="desktop"
            className="gap-1.5"
            onPress={() => setDialog({ kind: 'form', id: null, initial: EMPTY_STAFF_FORM })}
          >
            <IconUserPlus className="size-4.5" />
            Tambah staf
          </Button>
        }
      />
      <SettingsTabs active="staff" />
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Table className="max-sm:hidden">
          <TableHeader>
            <tr className={TABLE_HEAD_ROW}>
              <TableHead className="px-4.5 first:pl-4.5">Staf</TableHead>
              <TableHead>Peran</TableHead>
              <TableHead>Shift</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="max-lg:hidden">Terakhir aktif</TableHead>
              <TableHead className="pr-4.5 last:pr-4.5">
                <span className="sr-only">Aksi</span>
              </TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.id} className={cn(!account.active && 'bg-background')}>
                <TableCell className="px-4.5 py-3 first:pl-4.5">
                  <div className="flex items-center gap-2.5">
                    <InitialsAvatar initials={initialsOf(account.name)} />
                    <span>
                      <span className="block font-semibold">{account.name}</span>
                      <span className="block font-mono text-caption leading-[1.3] text-muted-foreground">
                        {account.phone}
                      </span>
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-3">{account.role}</TableCell>
                <TableCell className="py-3 text-foreground-secondary">{account.shift}</TableCell>
                <TableCell className="py-3">
                  <ToneBadge tone={account.active ? 'ok' : 'off'}>
                    {account.active ? 'Aktif' : 'Nonaktif'}
                  </ToneBadge>
                </TableCell>
                <TableCell className="py-3 text-foreground-secondary max-lg:hidden">
                  {account.lastSeen}
                </TableCell>
                <TableCell className="py-3 pr-4.5 last:pr-4.5">{actions(account)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <ul className="sm:hidden">
          {accounts.map((account) => (
            <li
              key={account.id}
              className={cn(
                'flex flex-col gap-2 border-t border-border px-4 py-3.5 first:border-t-0',
                !account.active && 'bg-background'
              )}
            >
              <div className="flex items-center gap-2.5">
                <InitialsAvatar initials={initialsOf(account.name)} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] leading-[1.3] font-semibold">
                    {account.name}
                  </span>
                  <span className="block text-meta leading-[1.3] text-muted-foreground">
                    {account.role} · {account.shift}
                  </span>
                </span>
                <ToneBadge tone={account.active ? 'ok' : 'off'}>
                  {account.active ? 'Aktif' : 'Nonaktif'}
                </ToneBadge>
              </div>
              {actions(account)}
            </li>
          ))}
        </ul>
        <p className="border-t border-border px-4.5 py-3 text-meta leading-[1.4] text-muted-foreground">
          {active} aktif · {accounts.length} akun · akun nonaktif tidak bisa masuk, riwayatnya tetap
          tersimpan
        </p>
      </div>
      {dialog?.kind === 'form' && (
        <StaffFormDialog
          isOpen
          onOpenChange={(isOpen) => !isOpen && setDialog(null)}
          isEditing={dialog.id !== null}
          initial={dialog.initial}
          onSave={(form) => {
            saveStaff(form, dialog.id, { onSuccess: () => setDialog(null), onError })
          }}
        />
      )}
      <DeactivateStaffDialog
        isOpen={dialog?.kind === 'off'}
        onOpenChange={(isOpen) => !isOpen && setDialog(null)}
        name={deactivating?.name ?? ''}
        onConfirm={() => {
          if (deactivating) {
            setStaffActive(deactivating.id, false, { onSuccess: () => setDialog(null) })
          }
        }}
      />
      <Dialog
        isOpen={!!shownPassword}
        onOpenChange={(isOpen) => !isOpen && setShownPassword(null)}
        variant="panel"
        role="alertdialog"
      >
        <DialogTitleBar>Kata sandi sementara</DialogTitleBar>
        <DialogDescription className="text-note leading-normal">
          Berikan kata sandi ini ke {shownPassword?.name}. Kata sandi hanya ditampilkan sekali;
          minta staf menggantinya di Profil setelah masuk.
        </DialogDescription>
        <p className="rounded-md border border-border bg-background px-3 py-3 text-center font-mono text-xl font-semibold tracking-wider select-all">
          {shownPassword?.password}
        </p>
        <p className="text-meta leading-[1.4] text-foreground-secondary">{shownPassword?.notice}</p>
        <div className="flex justify-end">
          <DialogClose size="desktop">Sudah dicatat</DialogClose>
        </div>
      </Dialog>
    </AdminLayout>
  )
}
