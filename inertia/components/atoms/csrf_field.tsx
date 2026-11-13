import { usePage } from '@inertiajs/react'

// Server-rendered forms work before React has taken over the page: a plain form post then carries
// the CSRF token in the `_csrf` field that Shield reads. Inertia's own submits use the XSRF cookie.
export default function CsrfField() {
  const token = usePage().props.csrfToken

  return token ? <input type="hidden" name="_csrf" value={token} /> : null
}
