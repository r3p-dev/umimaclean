import { type ReactNode, useState } from 'react'
import { IconArrowsHorizontal } from '@tabler/icons-react'
import { cn } from '~/lib/shared/utils'

export default function CompareSlider({
  before,
  after,
  className,
}: {
  before: ReactNode
  after: ReactNode
  className?: string
}) {
  const [position, setPosition] = useState<number>(50)

  return (
    <div className={cn('relative isolate overflow-hidden rounded-lg select-none', className)}>
      {after}

      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        {before}
      </div>

      <span className="absolute top-3 left-3 rounded-pill bg-surface-glass px-2.5 py-1.5 text-caption leading-none font-semibold text-foreground">
        Sebelum
      </span>
      <span className="absolute top-3 right-3 rounded-pill bg-surface-glass px-2.5 py-1.5 text-caption leading-none font-semibold text-foreground">
        Sesudah
      </span>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-card shadow-pin"
        style={{ left: `${position}%` }}
      />

      <input
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(event) => setPosition(Number(event.target.value))}
        aria-label="Geser untuk membandingkan sebelum dan sesudah dicuci"
        aria-valuetext={`${position}% sebelum, ${100 - position}% sesudah`}
        className="peer absolute inset-0 z-10 m-0 size-full cursor-ew-resize touch-pan-y appearance-none bg-transparent opacity-0 [&::-moz-range-thumb]:h-full [&::-moz-range-thumb]:w-11 [&::-webkit-slider-thumb]:h-full [&::-webkit-slider-thumb]:w-11 [&::-webkit-slider-thumb]:appearance-none"
      />

      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 z-5 grid size-11 -translate-1/2 place-items-center rounded-full bg-card text-foreground shadow-1 peer-focus-visible:focus-ring"
        style={{ left: `${position}%` }}
      >
        <IconArrowsHorizontal className="size-6" />
      </span>
    </div>
  )
}
