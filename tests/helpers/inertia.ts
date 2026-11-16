import type { ApiClient, ApiResponse } from '@japa/api-client'

// Follows a redirect with the same session and flash messages, as the browser does after a
// form post, so a test can assert what the next page receives (its `errors` prop, for example).
export function visitRedirect(client: ApiClient, response: ApiResponse) {
  const location = response.header('location')
  if (!location) {
    throw new Error(`Expected a redirect, got status ${response.status()}`)
  }

  return client
    .get(location)
    .withInertia()
    .withSession(response.session())
    .withFlashMessages(response.flashMessages())
}
