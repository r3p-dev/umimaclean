import { useId } from 'react'
import {
  IconCircleCheck,
  IconInfoCircle,
  IconListSearch,
  IconUserCheck,
  IconUserPlus,
} from '@tabler/icons-react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { FieldDescription } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import type { KnownCustomer } from '~/lib/store/walk_in'

export default function WalkInCustomer({
  phone,
  name,
  isComplete,
  match,
  isPicked,
  onPhone,
  onName,
  onPick,
  onUnpick,
}: {
  phone: string
  name: string
  isComplete: boolean
  match: KnownCustomer | null
  isPicked: boolean
  onPhone: (value: string) => void
  onName: (value: string) => void
  onPick: () => void
  onUnpick: () => void
}) {
  const phoneId = useId()
  const nameId = useId()
  const isNotFound = isComplete && !match
  const StatusIcon = !isComplete ? IconListSearch : match ? IconUserCheck : IconUserPlus

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2">1 · Pelanggan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <Label htmlFor={phoneId}>Nomor HP / WhatsApp</Label>
          <Input
            id={phoneId}
            type="tel"
            inputMode="numeric"
            autoComplete="off"
            placeholder="08xxxxxxxxxx"
            value={phone}
            aria-describedby={`${phoneId}-status`}
            onChange={(event) => onPhone(event.target.value)}
            className="text-base tracking-wide"
          />
          <span
            id={`${phoneId}-status`}
            role="status"
            className="flex items-center gap-1.5 text-caption text-muted-foreground"
          >
            <StatusIcon className="size-3.75 shrink-0" />
            {!isComplete
              ? 'Sistem mengecek otomatis setelah nomor lengkap.'
              : match
                ? 'Nomor terdaftar.'
                : 'Nomor belum terdaftar.'}
          </span>
        </div>
        {match && !isPicked && (
          <button
            type="button"
            onClick={onPick}
            aria-label={`Pilih pelanggan ${match.name}`}
            className="-mt-1 grid w-full grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 rounded-md border-[1.5px] border-primary bg-accent-subtle px-3.5 py-3 text-left text-foreground hover:bg-accent"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-card text-base leading-none font-semibold text-info-foreground">
              {match.initial}
            </span>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-xs font-semibold text-info-foreground">
                Pelanggan ditemukan
              </span>
              <span className="text-md font-semibold">{match.name}</span>
              <span className="text-meta text-muted-foreground">
                {match.masked} · {match.history}
              </span>
            </span>
            <span className="text-note leading-none font-semibold whitespace-nowrap text-info-foreground">
              Pilih
            </span>
          </button>
        )}
        {isNotFound && (
          <p className="-mt-1 flex gap-1.5 text-note font-medium text-foreground-secondary">
            <IconInfoCircle className="mt-px size-4.25 shrink-0 text-muted-foreground" />
            Tidak ada pelanggan dengan nomor ini. Isi nama untuk melanjutkan.
          </p>
        )}
        <div className="flex flex-col gap-2">
          <Label htmlFor={nameId}>Nama</Label>
          {isPicked && match ? (
            <>
              <div className="flex h-input items-center gap-2 rounded-md border border-success-border-soft bg-success-subtle pr-1.5 pl-3.5 text-base leading-none font-medium">
                <IconCircleCheck className="size-4.75 text-success-foreground" />
                <span id={nameId} className="flex-1">
                  {match.name}
                </span>
                <Button
                  variant="ghost"
                  size="compact"
                  onPress={onUnpick}
                  className="rounded-inner px-2.5 text-note text-primary"
                >
                  Ganti
                </Button>
              </div>
              <FieldDescription className="text-caption">
                Data pelanggan dipakai ulang: riwayat pesanan dan alamat tersimpan. Tidak ada data
                ganda.
              </FieldDescription>
            </>
          ) : (
            <>
              <Input
                id={nameId}
                autoComplete="off"
                placeholder={
                  match ? 'Pilih saran di atas untuk mengisi otomatis' : 'Nama pelanggan'
                }
                value={name}
                onChange={(event) => onName(event.target.value)}
              />
              {isNotFound && (
                <FieldDescription className="text-caption">
                  Disimpan sebagai pelanggan saat transaksi dibuat. Pelanggan bisa daftar akun
                  dengan nomor ini untuk melacak pesanan.
                </FieldDescription>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
