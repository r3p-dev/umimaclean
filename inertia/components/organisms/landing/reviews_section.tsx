import {
  IconArrowLeft,
  IconArrowRight,
  IconExternalLink,
  IconStarFilled,
} from '@tabler/icons-react'
import InitialsAvatar from '~/components/atoms/initials_avatar'
import { Button, LinkButton } from '~/components/ui/button'
import { Card } from '~/components/ui/card'
import { customerLinks } from '~/lib/navigation/customer_links'
import { GOOGLE_RATING, GOOGLE_REVIEWS, initialsOf } from '~/lib/reviews/google_reviews'
import { useSnapCarousel } from '~/lib/shared/carousel'
import { cn } from '~/lib/shared/utils'

function Stars({ rating }: { rating: number }) {
  return (
    <span
      role="img"
      aria-label={`${rating} dari 5 bintang`}
      className="flex gap-0.5 text-attention-solid"
    >
      {Array.from({ length: 5 }, (_, index) => (
        <IconStarFilled
          key={index}
          className={cn('size-4', index >= rating && 'text-border-strong')}
        />
      ))}
    </span>
  )
}

export default function ReviewsSection() {
  const rating = GOOGLE_RATING.toLocaleString('id-ID', { minimumFractionDigits: 1 })
  const {
    ref: trackRef,
    index: active,
    previous,
    next,
    atStart,
    atEnd,
  } = useSnapCarousel<HTMLUListElement>(GOOGLE_REVIEWS.length)

  return (
    <section
      id="ulasan"
      aria-labelledby="ulasan-heading"
      className="mx-auto box-content flex max-w-page flex-col gap-4 px-5 pt-10 pb-2"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div className="flex flex-col gap-2">
          <h2 id="ulasan-heading" className="text-title">
            Kata pelanggan
          </h2>

          <p className="max-w-160 text-md leading-[1.55] text-pretty text-foreground-secondary">
            Ulasan dari pelanggan kami di Google Maps.
          </p>
        </div>

        <LinkButton
          variant="ghost"
          href={customerLinks.maps}
          target="_blank"
          rel="noreferrer"
          className="group inline-flex h-auto min-h-icon-btn shrink-0 items-center gap-2 self-start px-0 font-normal hover:bg-transparent sm:self-auto"
        >
          <span className="text-lg leading-none font-bold text-foreground">{rating}</span>
          <Stars rating={GOOGLE_RATING} />

          <span className="text-sm leading-none font-semibold text-primary group-hover:text-primary-hover group-hover:underline">
            Lihat di Google Maps
          </span>
          <IconExternalLink className="size-4 text-icon-muted" />
        </LinkButton>
      </div>

      <ul
        ref={trackRef}
        id="ulasan-list"
        className="-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 scrollbar-none sm:mx-0 sm:block sm:columns-2 sm:gap-4 sm:overflow-visible sm:px-0 lg:columns-3"
      >
        {GOOGLE_REVIEWS.map((review, index) => (
          <li
            key={review.url}
            aria-label={`Ulasan ${index + 1} dari ${GOOGLE_REVIEWS.length}`}
            className="w-[84%] shrink-0 snap-start sm:mb-4 sm:w-auto sm:break-inside-avoid"
          >
            <Card className="flex h-full flex-col gap-3 p-5">
              <Stars rating={review.rating} />
              <blockquote className="text-md leading-normal text-pretty text-foreground">
                “{review.text}”
              </blockquote>

              <div className="mt-auto flex items-center gap-3">
                <InitialsAvatar initials={initialsOf(review.name)} />

                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-sm leading-[1.3] font-semibold">{review.name}</span>
                  <span className="text-caption text-muted-foreground">Ulasan Google Maps</span>
                </span>

                <LinkButton
                  variant="ghost"
                  size="icon-compact"
                  href={review.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Buka ulasan ${review.name} di Google Maps`}
                  className="hit-area rounded-xs text-icon-muted hover:text-foreground"
                >
                  <IconExternalLink className="size-4.5" />
                </LinkButton>
              </div>
            </Card>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between gap-3 sm:hidden">
        <div aria-hidden="true" className="flex gap-1.5">
          {GOOGLE_REVIEWS.map((review, index) => (
            <span
              key={review.url}
              className={cn(
                'h-1.5 rounded-pill transition-[width,background-color] duration-200',
                index === active ? 'w-5 bg-primary' : 'w-1.5 bg-border-strong'
              )}
            />
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label="Ulasan sebelumnya"
            aria-controls="ulasan-list"
            isDisabled={atStart}
            onPress={previous}
          >
            <IconArrowLeft className="size-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            aria-label="Ulasan berikutnya"
            aria-controls="ulasan-list"
            isDisabled={atEnd}
            onPress={next}
          >
            <IconArrowRight className="size-5" />
          </Button>
        </div>
      </div>
    </section>
  )
}
