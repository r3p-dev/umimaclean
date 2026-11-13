// The browser tab title of every page, in the browser and on the server (SSR).
export function pageTitle(title: string) {
  return title ? `${title} - Umima Clean` : 'Umima Clean'
}
