// Words that say what kind of place it is, not which one; searching for them matches half the city.
const GENERIC_WORDS = new Set([
  'jalan',
  'jl',
  'jln',
  'gang',
  'gg',
  'komplek',
  'kompleks',
  'komp',
  'perumahan',
  'perum',
])

// The typed search without generic words (MAP-1): "Jl. Gang Sukaluyu" → "sukaluyu". When nothing
// specific is left ("jalan"), the text is searched as typed.
export function searchTerm(text: string) {
  const words = text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
  const specific = words.filter((word) => !GENERIC_WORDS.has(word))
  return (specific.length > 0 ? specific : words).join(' ')
}
