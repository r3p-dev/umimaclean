export type BillRow = {
  name: string
  meta: string
  services: { name: string; price: string }[]
  subtotal: string
}

export default function BillLineItem({ row }: { row: BillRow }) {
  return (
    <li className="flex flex-col gap-2.5 border-b border-border py-3.5">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="stripes size-11 shrink-0 rounded-md [--stripe:6px]" />
        <div className="min-w-0">
          <div className="text-[15px] leading-[1.3] font-semibold">{row.name}</div>
          <div className="text-meta leading-[1.4] text-muted-foreground">{row.meta}</div>
        </div>
      </div>
      <div className="flex flex-col gap-1.5 pl-14">
        {row.services.map((service) => (
          <div
            key={service.name}
            className="flex items-baseline justify-between gap-3 text-[14.5px] leading-[1.4]"
          >
            <span>{service.name}</span>
            <span className="shrink-0">{service.price}</span>
          </div>
        ))}
        <div className="mt-0.5 flex items-baseline justify-between gap-3 border-t border-dashed border-border-strong pt-2 text-[14.5px] leading-[1.3] font-semibold">
          <span>Subtotal</span>
          <span className="shrink-0">{row.subtotal}</span>
        </div>
      </div>
    </li>
  )
}
