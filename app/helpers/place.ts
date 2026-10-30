const CITY_ONLY = /^((kota|kab\.?|kabupaten)\s+)?(bandung( barat)?|cimahi)$/i
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
  'blok',
])
const MIN_TERM_LENGTH = 3

function withoutGenericWords(term: string) {
  const specific = term
    .split(/\s+/)
    .filter((word) => !GENERIC_WORDS.has(word.toLowerCase().replace(/[^a-z]/g, '')))
    .join(' ')
  return specific.length >= MIN_TERM_LENGTH ? specific : term
}

export function searchTerms(text: string) {
  const segments = text
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part && !/^rt\b|^rw\b|\brt\s*\d|\brw\s*\d/i.test(part))
  const street = (segments[0] ?? '')
    .replace(/\bno\.?\s*\S+/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
  const shortStreet = street.replace(/\s+([ivx]+|\d+[a-z]?)$/i, '').trim()
  const localities = segments.slice(1).filter((part) => !CITY_ONLY.test(part))
  return [...new Set([street, shortStreet, ...localities].filter(Boolean).map(withoutGenericWords))]
}
