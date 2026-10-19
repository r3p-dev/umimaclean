import { IconArrowsMinimize, IconCamera, IconZoomIn } from '@tabler/icons-react'
import { Button } from '~/components/ui/button'
import MediaPlaceholder from '~/components/atoms/media_placeholder'
import type { ProofView } from '~/lib/tracking/status'

export default function ProofPhoto({
  proof,
  expanded,
  onToggle,
}: {
  proof: ProofView
  expanded: boolean
  onToggle: () => void
}) {
  if (!proof.available) {
    return (
      <p className="mt-1 flex items-start gap-2 rounded-md border border-dashed border-input bg-surface-glass px-2.5 py-2 text-meta leading-[1.4] text-foreground-secondary">
        <IconCamera className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <span>
          <strong className="font-semibold text-foreground">{proof.title}</strong> ·{' '}
          {proof.waitText}
        </span>
      </p>
    )
  }

  if (expanded) {
    return (
      <figure className="mt-1.5 max-w-130 overflow-hidden rounded-md border border-border bg-card">
        <MediaPlaceholder
          label={proof.caption}
          className="box-border aspect-4/3 rounded-none p-2.5"
        />
        <figcaption className="flex items-center gap-2 py-1.5 pr-1 pl-3.5">
          <div className="min-w-0 flex-1">
            <div className="text-sm leading-[1.3] font-semibold">{proof.title}</div>
            <div className="text-caption text-muted-foreground">
              {[proof.time, `oleh ${proof.by}`].filter(Boolean).join(' · ')}
            </div>
          </div>
          <Button variant="ghost" size="icon" aria-label="Perkecil foto" onPress={onToggle}>
            <IconArrowsMinimize className="size-5.5" />
          </Button>
        </figcaption>
      </figure>
    )
  }

  return (
    <Button
      variant="outline"
      onPress={onToggle}
      aria-label={`Perbesar ${proof.title}`}
      className="mt-1 grid h-auto max-w-full grid-cols-[104px_minmax(0,1fr)] items-center justify-start gap-3 self-start border-border py-1.5 pr-3.5 pl-1.5 text-left font-normal whitespace-normal"
    >
      <span className="stripes block aspect-4/3 w-26 rounded-inner [--stripe:6px]" />
      <span className="flex min-w-0 flex-col gap-0.75">
        <span className="text-note leading-tight font-semibold">{proof.title}</span>
        <span className="text-caption leading-[1.3] text-muted-foreground">oleh {proof.by}</span>
        <span className="mt-0.5 flex items-center gap-1 text-meta leading-none font-semibold text-primary">
          <IconZoomIn className="size-4" />
          Lihat foto
        </span>
      </span>
    </Button>
  )
}
