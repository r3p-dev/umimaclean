import type { ReactNode } from 'react'
import { Head } from '@inertiajs/react'

// Sets the document title and renders the page heading, description and actions.
// With isTitleHidden only the document title is set.
export default function Page({
  title,
  isTitleHidden = false,
  description,
  actions,
  children,
}: {
  title: string
  isTitleHidden?: boolean
  description?: ReactNode
  actions?: ReactNode
  children?: ReactNode
}) {
  const hasHeader = !isTitleHidden || description || actions

  return (
    <div className="page">
      <Head title={title} />
      {hasHeader && (
        <header className="page__header">
          <div>
            {!isTitleHidden && <h1 className="page__title">{title}</h1>}
            {description && <p className="page__description">{description}</p>}
          </div>
          {actions && <div className="page__actions">{actions}</div>}
        </header>
      )}
      {children}
    </div>
  )
}
