import { Head } from '@inertiajs/react'
import { pageTitle } from '~/lib/page_title'

// Title, description and Open Graph text of a public page (GUEST-3); the site-wide tags are in
// resources/views/inertia_layout.edge.
export default function SeoHead({ title, description }: { title: string; description: string }) {
  return (
    <Head title={title}>
      <meta head-key="description" name="description" content={description} />
      <meta head-key="og:title" property="og:title" content={pageTitle(title)} />
      <meta head-key="og:description" property="og:description" content={description} />
    </Head>
  )
}
