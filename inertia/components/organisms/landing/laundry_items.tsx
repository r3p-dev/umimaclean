const ITEMS = [
  {
    name: 'Sepatu',
    description: 'Sneakers, kanvas, kulit',
    src: 'https://images.unsplash.com/photo-1654147801991-a9fa8594e900?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D',
    alt: 'Foto sepatu',
  },
  {
    name: 'Tas',
    description: 'Ransel, tote, kulit',
    src: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800',
    alt: 'Foto tas ransel',
  },
  {
    name: 'Helm',
    description: 'Half-face, full-face',
    src: 'https://images.unsplash.com/photo-1494030575520-dd03dd6aeb04?q=80&w=1568&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D',
    alt: 'Foto helm',
  },
]

export default function LaundryItems() {
  return (
    <section className="mx-auto box-content flex max-w-page flex-col gap-4 px-5 pt-8 pb-2">
      <h2 className="text-title">Yang kami cuci</h2>
      <ul className="grid grid-cols-3 gap-[clamp(10px,2vw,24px)]">
        {ITEMS.map((item) => (
          <li key={item.name} className="flex flex-col gap-2">
            <img
              src={item.src}
              alt={item.alt}
              draggable={false}
              className="aspect-square w-full rounded-md object-cover shadow-sm"
            />
            <span className="text-md leading-[1.2] font-semibold">{item.name}</span>
            <span className="text-caption leading-[1.35] text-muted-foreground">
              {item.description}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
