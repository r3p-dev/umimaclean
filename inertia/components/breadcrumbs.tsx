/**
 * Breadcrumbs, on every page except the homepage.
 *
 * The matching BreadcrumbList JSON-LD is emitted server-side from
 * app/seo/schema.ts. The two are built from the same trail passed by the
 * controller, so what a reader sees and what a crawler reads cannot disagree.
 */
export type Crumb = { name: string; url: string }

export default function Breadcrumbs({ trail }: { trail: readonly Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mx-auto max-w-5xl px-5 pt-6">
      <ol className="flex flex-wrap items-center gap-x-2 text-xs text-ink-muted">
        <li>
          <a className="hover:underline" href="/">
            Beranda
          </a>
        </li>
        {trail.map((crumb, index) => {
          const isLast = index === trail.length - 1

          return (
            <li key={crumb.url} className="flex items-center gap-x-2">
              <span aria-hidden="true">/</span>
              {isLast ? (
                <span aria-current="page" className="text-ink-body">
                  {crumb.name}
                </span>
              ) : (
                <a className="hover:underline" href={crumb.url}>
                  {crumb.name}
                </a>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
