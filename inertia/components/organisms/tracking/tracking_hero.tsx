import StatusBadge from '~/components/atoms/status_badge'
import PhaseProgress from '~/components/molecules/phase_progress'
import type { TrackingView } from '~/lib/tracking/status'

export default function TrackingHero({ view }: { view: TrackingView }) {
  return (
    <div className="grid items-end gap-x-8 gap-y-4.5 pt-1.5 pb-5 sm:grid-cols-2">
      <div className="flex flex-col gap-2.5">
        <StatusBadge status={view.status} size="lg" />
        <h1 className="text-[clamp(24px,calc(20px+0.8vw),32px)] leading-[1.2] font-bold tracking-[-0.015em] text-balance">
          {view.headline}
        </h1>
        <p className="text-[14.5px] leading-normal text-foreground-secondary">{view.subline}</p>
      </div>
      <PhaseProgress phases={view.phases} tone={view.tone} />
    </div>
  )
}
