import {
  IconArrowRight,
  IconCheck,
  IconCircleCheck,
  IconPlayerSkipForward,
} from '@tabler/icons-react'
import { urlFor } from '~/client'
import { Button, LinkButton } from '~/components/ui/button'
import type { Task } from '~/lib/tasks/queue'
import { cn } from '~/lib/shared/utils'

export function TaskFinish({
  noun,
  ok,
  name,
  meta,
  reason,
  next,
  nextNumber,
  onContinue,
}: {
  noun: string
  ok: boolean
  name: string
  meta: string
  reason: string | null
  next: Task | null
  nextNumber: number
  onContinue: () => void
}) {
  const Icon = ok ? IconCheck : IconPlayerSkipForward

  return (
    <div className="mx-auto flex max-w-120 flex-col items-center gap-2.5 px-5 pt-11 pb-7 text-center">
      <span
        className={cn(
          'flex size-16 items-center justify-center rounded-full',
          ok ? 'bg-success text-success-foreground' : 'bg-attention text-attention-foreground'
        )}
      >
        <Icon className="size-8.5" />
      </span>
      <h1 role="status" className="mt-1.5 text-[22px] leading-[1.25] font-bold">
        {noun} {ok ? 'selesai' : 'dilewati'}
      </h1>
      <p className="text-sm leading-[1.4] font-medium text-foreground-secondary">{name}</p>
      {ok ? (
        <p className="text-sm leading-[1.45] text-foreground-secondary">{meta}</p>
      ) : (
        <div className="flex flex-col gap-1 self-stretch rounded-md bg-attention px-3.5 py-3 text-left text-sm leading-[1.45] text-attention-foreground">
          <span>
            <strong className="font-semibold">Alasan:</strong> {reason}
          </span>
          <span>
            Ditandai <strong className="font-semibold">Dilewati · perlu tindak lanjut</strong>.
            Admin menghubungi pelanggan dan menjadwalkan ulang.
          </span>
        </div>
      )}
      {next ? (
        <>
          <div className="mt-2.5 flex flex-col gap-1.5 self-stretch rounded-lg border-[1.5px] border-primary p-3.5 text-left">
            <span className="text-xs leading-none font-semibold tracking-[0.06em] text-info-foreground uppercase">
              Berikutnya disarankan sistem
            </span>
            <div className="flex items-baseline justify-between gap-2.5">
              <span className="text-[17px] leading-[1.3] font-bold">
                #{nextNumber} {next.name}
              </span>
              <span className="text-base leading-none font-bold text-info-foreground">
                {next.km}
              </span>
            </div>
            <span className="text-note leading-[1.4] text-foreground-secondary">
              sekitar {next.area} · {next.count} barang
            </span>
          </div>
          <Button size="cta" onPress={onContinue} className="mt-1.5 self-stretch">
            Lanjut ke {noun} #{nextNumber}
            <IconArrowRight />
          </Button>
        </>
      ) : (
        <>
          <p className="mt-2 text-[15px] leading-[1.4] font-semibold">
            Semua {noun.toLowerCase()} hari ini sudah ditangani.
          </p>
          <LinkButton size="cta" className="self-stretch" href={urlFor('staff.home')}>
            Kembali ke Beranda
          </LinkButton>
        </>
      )}
    </div>
  )
}

export function TasksCleared({ noun }: { noun: string }) {
  return (
    <div className="mx-auto flex max-w-110 flex-col items-center gap-3 px-6 py-14 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-success text-success-foreground">
        <IconCircleCheck className="size-8" />
      </span>
      <h1 className="mt-1.5 text-xl leading-[1.3] font-bold">
        Semua {noun.toLowerCase()} hari ini sudah ditangani
      </h1>
      <LinkButton size="cta" className="self-stretch" href={urlFor('staff.home')}>
        Kembali ke Beranda
      </LinkButton>
    </div>
  )
}
