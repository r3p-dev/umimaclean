import { IconStarFilled } from '@tabler/icons-react'
import { cn } from 'cn'

export default function Stars({ rating }: { rating: number }) {
  return (
    <span
      role="img"
      aria-label={`${rating} dari 5 bintang`}
      className="flex gap-0.5 text-amber-500"
    >
      {Array.from({ length: 5 }, (_, index) => (
        <IconStarFilled key={index} className={cn('size-4', index >= rating && 'text-border')} />
      ))}
    </span>
  )
}
