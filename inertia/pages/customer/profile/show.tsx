import { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import {
  IconChevronRight,
  IconDevices,
  IconFileText,
  IconHelpCircle,
  IconLock,
  IconLogout,
  IconMapPin,
} from '@tabler/icons-react'
import type { Data } from '@generated/data'
import { urlFor } from '~/client'
import InitialsAvatar from '~/components/atoms/initials_avatar'
import ProfileShell from '~/components/organisms/profile/profile_shell'
import AccountLayout from '~/components/templates/account_layout'
import { Button, LinkButton } from '~/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { initialsOf } from '~/lib/navigation/account_links'
import { signOut } from '~/lib/shared/auth'
import { customerLinks } from '~/lib/navigation/customer_links'
import { addressSummary } from '~/lib/order/addresses'
import { formatMonthYear, timeAgo } from '~/lib/shared/date'

const TILE =
  'flex w-full min-h-16 items-center gap-3.5 border-b border-border px-4 py-3 text-left text-foreground no-underline last:border-b-0 hover:bg-accent hover:text-foreground hover:no-underline sm:min-h-0 sm:flex-col sm:items-start sm:gap-2 sm:rounded-lg sm:border sm:bg-card sm:p-5 sm:last:border-b'

export default function ProfileShow({
  user,
  addressCount,
  primaryLabel,
  deviceCount,
}: {
  user: Data.User
  addressCount: number
  primaryLabel: string | null
  deviceCount: number
}) {
  const [isConfirming, setConfirming] = useState(false)
  const [isBusy, setBusy] = useState(false)
  const tiles = [
    {
      icon: IconMapPin,
      title: 'Atur alamat',
      text: addressSummary(addressCount, primaryLabel),
      href: urlFor('customer.addresses.index'),
    },
    {
      icon: IconLock,
      title: 'Kata sandi',
      text: user.passwordChangedOn
        ? `Terakhir diubah ${timeAgo(user.passwordChangedOn)}`
        : 'Belum pernah diubah',
      href: `${urlFor('customer.profile.edit')}#kata-sandi`,
    },
  ]

  function signOutOthers() {
    router.post(
      urlFor('customer.profile.sign_out_others'),
      {},
      {
        onStart: () => setBusy(true),
        onFinish: () => {
          setBusy(false)
          setConfirming(false)
        },
      }
    )
  }

  return (
    <>
      <Head title="Profil" />
      <ProfileShell active="profil" title="Profil">
        <section className="mt-5 flex items-center gap-4 sm:rounded-lg sm:border sm:border-border sm:bg-card sm:p-6 lg:mt-4">
          <InitialsAvatar initials={initialsOf(user.name)} size="lg" />
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-xl leading-[1.25] font-bold tracking-[-0.01em]">{user.name}</span>
            <span className="text-sm leading-[1.4] text-foreground-secondary">
              {user.phone}
              <span className="max-sm:hidden"> · bergabung {formatMonthYear(user.joinedOn)}</span>
            </span>
          </span>
          <LinkButton
            href={urlFor('customer.profile.edit')}
            variant="outline"
            size="compact"
            className="px-3.5 max-sm:border-0 max-sm:bg-transparent max-sm:px-1 max-sm:font-semibold max-sm:text-primary"
          >
            <span className="sm:hidden">Ubah</span>
            <span className="max-sm:hidden">Ubah profil</span>
          </LinkButton>
        </section>
        <div className="mt-5 overflow-hidden rounded-lg border border-border bg-card sm:mt-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:border-0 sm:bg-transparent">
          {tiles.map(({ icon: Icon, title, text, href }) => (
            <Link key={title} href={href} className={TILE}>
              <Icon className="size-5.5 shrink-0 text-foreground-secondary sm:text-primary" />
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-[15px] leading-[1.3] font-semibold sm:text-base">
                  {title}
                </span>
                <span className="text-meta leading-[1.4] text-foreground-secondary sm:text-sm">
                  {text}
                </span>
              </span>
              <IconChevronRight className="size-5 text-muted-foreground sm:hidden" />
            </Link>
          ))}
          <button type="button" onClick={() => setConfirming(true)} className={TILE}>
            <IconDevices className="size-5.5 shrink-0 text-foreground-secondary sm:text-primary" />
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-[15px] leading-[1.3] font-semibold sm:text-base">
                Perangkat yang masuk
              </span>
              <span className="text-meta leading-[1.4] text-foreground-secondary sm:text-sm">
                {deviceCount} perangkat aktif
              </span>
            </span>
            <IconChevronRight className="size-5 text-muted-foreground sm:hidden" />
          </button>
        </div>
        <div className="mt-4 overflow-hidden rounded-lg border border-border bg-card lg:hidden">
          <a href={customerLinks.whatsapp} target="_blank" rel="noreferrer" className={TILE}>
            <IconHelpCircle className="size-5.5 shrink-0 text-foreground-secondary" />
            <span className="flex-1 text-[15px] leading-[1.3] font-medium">
              Bantuan & pertanyaan umum
            </span>
            <IconChevronRight className="size-5 text-muted-foreground sm:hidden" />
          </a>
          <a href={customerLinks.terms} className={TILE}>
            <IconFileText className="size-5.5 shrink-0 text-foreground-secondary" />
            <span className="flex-1 text-[15px] leading-[1.3] font-medium">
              Syarat layanan & privasi
            </span>
            <IconChevronRight className="size-5 text-muted-foreground sm:hidden" />
          </a>
          <button type="button" onClick={signOut} className={TILE}>
            <IconLogout className="size-5.5 shrink-0 text-destructive-text" />
            <span className="flex-1 text-[15px] leading-[1.3] font-medium text-destructive-text">
              Keluar
            </span>
          </button>
        </div>
      </ProfileShell>
      <Dialog isOpen={isConfirming} onOpenChange={setConfirming} role="alertdialog">
        <DialogHeader>
          <DialogTitle>Keluarkan perangkat lain?</DialogTitle>
          <DialogDescription>
            Akun Anda aktif di {deviceCount} perangkat. Semua perangkat lain harus masuk lagi dengan
            nomor dan kata sandi. Perangkat ini tetap masuk.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose size="cta" className="sm:size-auto sm:h-btn">
            Batal
          </DialogClose>
          <Button size="cta" onPress={signOutOthers} isPending={isBusy} className="sm:h-btn">
            Keluarkan Perangkat Lain
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  )
}

ProfileShow.layout = [AccountLayout]
