import { rupiah, type PriceItem } from '@content/services'

/**
 * A price list: a real table on desktop, stacked cards on a phone.
 *
 * The first attempt kept three columns with a min-width wider than a phone,
 * which pushed the price off screen behind a horizontal scroll — on the page
 * where the price is the entire point. The second dropped the description
 * column, which lost information. This keeps all three columns and changes the
 * layout instead: below `sm` each row becomes a card with the price on its own
 * labelled line, above `sm` it is an ordinary table.
 *
 * Every element carries an explicit ARIA role. Switching table elements to
 * `display: block` strips their implicit table semantics in most browsers, so
 * a screen reader would stop announcing rows and headers. The roles put that
 * back, and cost nothing on desktop where they simply restate the default.
 *
 * "Mulai dari" and "Tambahan" are spelled out rather than left to a footnote,
 * because the same distinction is what the Offer schema encodes: a start-from
 * price becomes a minPrice, and an add-on is not offered separately at all.
 */
const KIND_LABEL: Record<PriceItem['kind'], string> = {
  regular: '',
  startFrom: 'Mulai dari ',
  additional: 'Tambahan ',
}

export default function PriceTable({
  items,
  caption,
}: {
  items: readonly PriceItem[]
  caption: string
}) {
  return (
    <table role="table" className="w-full border-collapse text-left text-sm max-sm:block">
      <caption className="sr-only">{caption}</caption>

      <thead role="rowgroup" className="max-sm:sr-only">
        <tr role="row" className="border-b border-line">
          <th role="columnheader" scope="col" className="py-3 pr-4 font-semibold text-ink">
            Layanan
          </th>
          <th role="columnheader" scope="col" className="py-3 pr-4 font-semibold text-ink">
            Keterangan
          </th>
          <th role="columnheader" scope="col" className="py-3 text-right font-semibold text-ink">
            Harga
          </th>
        </tr>
      </thead>

      <tbody role="rowgroup" className="max-sm:block">
        {items.map((item) => (
          <tr
            role="row"
            key={item.name}
            className="border-b border-line/60 align-top max-sm:block max-sm:py-4"
          >
            <th
              role="rowheader"
              scope="row"
              className="py-3 pr-4 font-medium text-ink max-sm:block max-sm:py-0"
            >
              {item.name}
            </th>

            <td className="py-3 pr-4 text-ink-muted max-sm:block max-sm:py-0 max-sm:pt-1 max-sm:text-xs">
              {item.description}
            </td>

            <td className="py-3 text-right whitespace-nowrap text-ink-body max-sm:flex max-sm:justify-between max-sm:py-0 max-sm:pt-2 max-sm:text-left">
              {/* The column header is visually hidden on a phone, so repeat it inline */}
              <span aria-hidden="true" className="font-medium text-ink-muted sm:hidden">
                Harga
              </span>
              <span className="font-medium text-ink sm:font-normal sm:text-ink-body">
                {KIND_LABEL[item.kind]}
                {rupiah(item.price)}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
