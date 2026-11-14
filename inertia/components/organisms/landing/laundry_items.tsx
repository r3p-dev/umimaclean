import Photo from '~/components/atoms/photo'
import { Card } from '~/components/ui/card'

const ITEMS = [
  {
    name: 'Sepatu',
    description: 'Sneakers, kanvas, kulit, suede',
    src: '/images/landing/shoes',
    alt: 'Foto sepatu bersih',
  },
  {
    name: 'Tas',
    description: 'Ransel, tote, kulit',
    src: '/images/landing/bag',
    alt: 'Foto tas ransel',
  },
  {
    name: 'Helm',
    description: 'Half-face, full-face · bawa langsung ke toko',
    src: '/images/landing/helmet',
    alt: 'Foto helm',
  },
]

export default function LaundryItems() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-4 px-5 pt-10 pb-2">
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Yang kami cuci</h2>
      <ul className="grid grid-cols-3 gap-3">
        {ITEMS.map((item) => (
          <li key={item.name}>
            <Card className="gap-2 border-0 bg-transparent p-0 shadow-none ring-0">
              <Photo
                src={item.src}
                widths={[360, 720]}
                sizes="min(357px, calc(33vw - 20px))"
                alt={item.alt}
                isLazy
                className="aspect-square w-full rounded-xl object-cover"
              />
              <span className="flex flex-col gap-0.5">
                <span className="text-base font-semibold">{item.name}</span>
                <span className="text-sm text-muted-foreground">{item.description}</span>
              </span>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  )
}
