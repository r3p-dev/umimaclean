import { IconCheck, IconX } from '@tabler/icons-react'
import { Badge } from '~/components/ui/badge'

export default function OrderResultBadge({ cancelled }: { cancelled: boolean }) {
  return cancelled ? (
    <Badge variant="destructive" size="sm">
      <IconX className="size-3.25" />
      Dibatalkan
    </Badge>
  ) : (
    <Badge variant="muted" size="sm">
      <IconCheck className="size-3.25" />
      Selesai
    </Badge>
  )
}
