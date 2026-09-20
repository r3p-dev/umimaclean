import { COVERAGE_MAP } from '@content/coverage_map'
import { COVERED_KECAMATAN } from '@content/areas'

/**
 * The coverage map: inline SVG, zero JavaScript, no filters.
 *
 * Inline rather than an <img> because an image costs a request and kills both
 * the native tooltips and text extraction. No `feDropShadow` or any other SVG
 * filter — filters are expensive to rasterise on mobile and would work directly
 * against the performance target.
 *
 * The raised effect comes from a single <use> that re-renders the whole covered
 * group three units lower in a darker tone. One element, zero extra geometry;
 * duplicating forty-three paths would double the bytes for the same picture.
 * SVG allows <use> to reference an element defined later in the document, which
 * is what puts the shadow underneath.
 *
 * This map does not rank. Crawlers do not read path data, so the covered and
 * "belum terjangkau" lists beneath it are what actually answer "apakah X masuk
 * area" — the map is here to convince the human.
 */
export default function CoverageMap({
  highlight,
  label,
}: {
  /** Kecamatan to pick out — the ones this page is about. */
  highlight?: readonly string[]
  /** Overrides the aria-label when the map is scoped to one area. */
  label?: string
} = {}) {
  const picked = new Set(highlight ?? [])

  return (
    <figure className="mt-8">
      <svg
        viewBox={`0 0 ${COVERAGE_MAP.width} ${COVERAGE_MAP.height + 3}`}
        className="h-auto w-full max-w-2xl"
        role="img"
        aria-label={
          label ??
          `Peta area antar jemput gratis UmimaClean: ${COVERED_KECAMATAN.length} kecamatan di Kota Bandung, Kota Cimahi, dan sebagian Kabupaten Bandung. Daftar lengkapnya ada di bawah peta ini.`
        }
      >
        {/*
          Presentation lives on the groups, not on each path. Fifty-three
          repetitions of fill and stroke cost several kilobytes in the document
          for no visual difference, and inheritance is also what makes the
          shadow layer work: the covered paths carry no fill of their own, so
          the <use> below can recolour its clone simply by setting one.
        */}
        <g fill="#d4d3cf" stroke="#bab9b5" strokeWidth="1">
          <path d={COVERAGE_MAP.background} />

          {/*
            Neighbours people actually ask about stay individual purely so they
            keep a tooltip — "is Padalarang covered?" should be answerable by
            hovering, not only by reading the list.
          */}
          {COVERAGE_MAP.neighbours.map((shape) => (
            <path key={shape.name} d={shape.d}>
              {/* One expression, so React emits a single text node rather than
                  splitting it around a <!-- --> marker */}
              <title>{`${shape.name} — di luar jangkauan`}</title>
            </path>
          ))}
        </g>

        {/* The shadow layer: one element, no duplicated geometry, no filter */}
        <use href="#covered" y="3" fill="#111111" />

        {/*
          When one area is picked out, the rest of the coverage steps back a
          tone so the highlight actually reads. Without that the two shades sit
          too close together to tell apart at the size this renders.
        */}
        <g fill={picked.size > 0 ? '#6f6e6a' : '#3a3a38'} stroke="#e9e9e7" strokeWidth="1">
          <g id="covered">
            {COVERAGE_MAP.covered.map((shape) => (
              <path
                key={shape.name}
                d={shape.d}
                {...(picked.has(shape.name) ? { fill: '#111111' } : {})}
              >
                {/*
                  The heading above already says these are service areas, so the
                  tooltip is just the name — forty-three copies of "terjangkau,
                  antar jemput gratis" would be forty-three copies of nothing.
                */}
                <title>{`Kecamatan ${shape.name}`}</title>
              </path>
            ))}
          </g>
        </g>
      </svg>

      <figcaption className="mt-3 text-xs text-ink-muted">
        {picked.size > 0
          ? 'Area gelap adalah kecamatan yang dijangkau antar jemput gratis; yang paling pekat adalah area di halaman ini. '
          : 'Area gelap adalah kecamatan yang dijangkau antar jemput gratis. '}
        Batas wilayah:{' '}
        <a
          className="underline hover:no-underline"
          href="https://geoservices.big.go.id"
          rel="noreferrer"
        >
          Badan Informasi Geospasial
        </a>{' '}
        (RBI 1:10.000).
      </figcaption>
    </figure>
  )
}
