import { IconExternalLink } from '@tabler/icons-react'
import { cn } from 'cn'
import Stars from '~/components/atoms/stars'
import { GOOGLE_RATING, GOOGLE_REVIEWS } from '~/lib/reviews/google_reviews'
import { STORE_CONTACT } from '~/lib/store/contact'

// Phones show the first three reviews; the rest are one tap away on Google Maps.
const SHOWN_ON_PHONES = 3

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function ReviewsSection() {
  const rating = GOOGLE_RATING.toLocaleString('id-ID', { minimumFractionDigits: 1 })

  return (
    <section
      id="ulasan"
      className="mx-auto flex max-w-6xl scroll-mt-4 flex-col gap-5 px-5 pt-12 pb-2"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Kata pelanggan</h2>
          <p className="text-base text-foreground/80">Ulasan dari pelanggan kami di Google Maps.</p>
        </div>
        <a
          href={STORE_CONTACT.mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="group inline-flex min-h-11 shrink-0 items-center gap-2 self-start sm:self-auto"
        >
          <span className="text-lg leading-none font-bold">{rating}</span>
          <Stars rating={GOOGLE_RATING} />
          <span className="text-sm font-semibold text-primary group-hover:underline">
            Lihat di Google Maps
          </span>
          <IconExternalLink className="size-4 text-muted-foreground" />
        </a>
      </div>
      <ul className="flex flex-col gap-3 sm:block sm:columns-2 sm:gap-4 lg:columns-3">
        {GOOGLE_REVIEWS.map((review, index) => (
          <li
            key={review.url}
            className={cn(
              'flex flex-col gap-3 rounded-xl border border-border bg-card p-5 sm:mb-4 sm:break-inside-avoid',
              index >= SHOWN_ON_PHONES && 'max-sm:hidden'
            )}
          >
            <Stars rating={review.rating} />
            <blockquote className="text-base text-pretty">“{review.text}”</blockquote>
            <div className="mt-auto flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                {initialsOf(review.name)}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-semibold">{review.name}</span>
                <span className="text-sm text-muted-foreground">Ulasan Google Maps</span>
              </span>
              <a
                href={review.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`Buka ulasan ${review.name} di Google Maps`}
                className="flex size-11 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <IconExternalLink className="size-4.5" />
              </a>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
