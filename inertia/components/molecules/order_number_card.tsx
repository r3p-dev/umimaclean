import { toast } from 'sonner'
import { IconCopy } from '@tabler/icons-react'
import { Button } from '~/components/ui/button'
import StatusBadge from '~/components/atoms/status_badge'
import type { OrderStatus } from '~/lib/tracking/status'

export default function OrderNumberCard({
  number,
  status,
}: {
  number: string
  status: OrderStatus
}) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(number)
      toast.success('Nomor pesanan disalin.')
    } catch {
      toast.error('Gagal menyalin. Catat nomor pesanan secara manual.')
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-4 sm:max-w-120">
      <div className="flex flex-col gap-1.5">
        <span className="text-caption leading-none font-medium text-muted-foreground">
          Nomor pesanan
        </span>
        <span className="font-mono text-[20px] leading-none font-semibold tracking-[0.02em]">
          {number}
        </span>
        <StatusBadge status={status} className="mt-1 px-2.25" />
      </div>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Salin nomor pesanan"
        onPress={copy}
        className="size-11.5 border-border-strong"
      >
        <IconCopy />
      </Button>
    </div>
  )
}
