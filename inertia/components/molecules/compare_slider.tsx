import { useState, type ReactNode } from 'react'
import { IconArrowsHorizontal } from '@tabler/icons-react'
import { cn } from 'cn'

// A native range input lies invisibly over both photos: dragging or the arrow keys move the divider.
export default function CompareSlider({
  before,
  after,
  className,
}: {
  before: ReactNode
  after: ReactNode
  className?: string
}) {
  const [position, setPosition] = useState(50)

  return (
    <div className={cn('relative isolate overflow-hidden rounded-xl select-none', className)}>
      {after}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        {before}
      </div>

      <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1.5 text-sm leading-none font-semibold text-foreground">
        Sebelum
      </span>
      <span className="absolute top-3 right-3 rounded-full bg-white/90 px-3 py-1.5 text-sm leading-none font-semibold text-foreground">
        Sesudah
      </span>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow"
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
        className="peer absolute inset-0 z-10 m-0 size-full cursor-ew-resize touch-pan-y appearance-none bg-transparent opacity-0"
      />

      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 z-20 grid size-11 -translate-1/2 place-items-center rounded-full bg-white text-foreground shadow-md peer-focus-visible:ring-3 peer-focus-visible:ring-ring"
        style={{ left: `${position}%` }}
      >
        <IconArrowsHorizontal className="size-6" />
      </span>
    </div>
  )
}
