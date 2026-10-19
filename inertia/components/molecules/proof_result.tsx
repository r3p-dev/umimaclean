import { IconCircleCheck } from '@tabler/icons-react'
import { Button } from '~/components/ui/button'

export default function ProofResult({
  title,
  photo,
  stamp,
  onRetake,
}: {
  title: string
  photo: string
  stamp: string
  onRetake: () => void
}) {
  return (
    <div className="grid grid-cols-[104px_minmax(0,1fr)] items-center gap-3 rounded-md border border-success-border-soft bg-success-subtle p-2">
      <img
        src={photo}
        alt={title}
        className="aspect-4/3 w-full stripes rounded-inner object-cover [--stripe:6px]"
      />
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="flex items-center gap-1.5 text-sm leading-[1.3] font-semibold text-success-foreground">
          <IconCircleCheck className="size-4.5 shrink-0" />
          {title} diambil
        </span>
        <span className="text-xs leading-[1.4] text-muted-foreground">{stamp}</span>
        <Button
          variant="ghost"
          size="compact"
          onPress={onRetake}
          className="h-btn-compact self-start px-0 text-[13.5px] text-primary hover:bg-transparent"
        >
          Ulangi foto
        </Button>
      </div>
    </div>
  )
}
