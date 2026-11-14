import * as React from 'react'
import { IconExternalLink } from '@tabler/icons-react'
import { cn } from 'cn'
import Stars from '~/components/atoms/stars'
import { Card } from '~/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '~/components/ui/carousel'
import { GOOGLE_RATING, GOOGLE_REVIEWS } from '~/lib/reviews/google_reviews'
import { STORE_CONTACT } from '~/lib/store/contact'

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function ReviewCard({ review }: { review: (typeof GOOGLE_REVIEWS)[number] }) {
  return (
    <Card className="flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-none ring-0">
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
    </Card>
  )
}

export default function ReviewsSection() {
  const rating = GOOGLE_RATING.toLocaleString('id-ID', { minimumFractionDigits: 1 })
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    if (!api) return

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap())
      setCount(api.scrollSnapList().length)
    }

    queueMicrotask(onSelect)
    api.on('select', onSelect)
    api.on('reInit', onSelect)

    return () => {
      api.off('select', onSelect)
      api.off('reInit', onSelect)
    }
  }, [api])

  return (
    <section
      id="ulasan"
      aria-labelledby="ulasan-heading"
      className="mx-auto flex max-w-6xl scroll-mt-4 flex-col gap-5 px-5 pt-12 pb-2"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div className="flex flex-col gap-2">
          <h2 id="ulasan-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">
            Kata pelanggan
          </h2>
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

      {/* Mobile view: official shadcn Carousel */}
      <div className="sm:hidden">
        <Carousel
          setApi={setApi}
          opts={{ align: 'start', loop: false }}
          className="w-full"
          aria-label="Daftar ulasan pelanggan"
        >
          <CarouselContent className="-ml-3">
            {GOOGLE_REVIEWS.map((review, i) => (
              <CarouselItem
                key={review.url}
                className="basis-[84%] pl-3"
                aria-label={`Ulasan ${i + 1} dari ${GOOGLE_REVIEWS.length}`}
              >
                <ReviewCard review={review} />
              </CarouselItem>
            ))}
          </CarouselContent>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div aria-hidden="true" className="flex gap-1.5">
              {Array.from({ length: count || GOOGLE_REVIEWS.length }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'h-1.5 rounded-full transition-[width,background-color] duration-200',
                    i === current ? 'w-5 bg-primary' : 'w-1.5 bg-border'
                  )}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <CarouselPrevious
                className="static size-11 min-h-11 min-w-11 translate-none"
                aria-label="Ulasan sebelumnya"
              />
              <CarouselNext
                className="static size-11 min-h-11 min-w-11 translate-none"
                aria-label="Ulasan berikutnya"
              />
            </div>
          </div>
        </Carousel>
      </div>

      {/* Desktop view: multi-column masonry */}
      <ul
        aria-label="Daftar ulasan pelanggan"
        className="hidden sm:block sm:columns-2 sm:gap-4 lg:columns-3"
      >
        {GOOGLE_REVIEWS.map((review) => (
          <li key={review.url} className="mb-4 break-inside-avoid">
            <ReviewCard review={review} />
          </li>
        ))}
      </ul>
    </section>
  )
}
