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

// A house number, block or RT/RW with its value ("No. 35", "Blok C2", "RT 02/RW 05"): never in a
// street or place name.
const HOUSE_DETAILS = /\b(no|nomor|blok|rt|rw)\b\.?\s*[\w/-]*/gi

// The searchable part of the address text the customer types (MAP-1, D110): the part before the
// first comma, without house details and generic words. "Jl. Dipatiukur No. 35, RT 02/RW 05,
// Lebakgede" → "dipatiukur". When nothing specific is left ("jalan"), the text is searched as typed.
export function searchTerm(text: string) {
  const [firstPart] = text.split(',')
  const words = firstPart
    .replace(HOUSE_DETAILS, ' ')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
  const specific = words.filter((word) => !GENERIC_WORDS.has(word))
  if (specific.length > 0) {
    return specific.join(' ')
  }
  return words.length > 0 ? words.join(' ') : text.toLowerCase().trim()
}
