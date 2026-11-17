// Lowercase letters only, without a leading "Kec." or "Kecamatan": "Kec. Bojong Soang" → "bojongsoang".
export function normalizeDistrictName(value: string) {
  return value
    .toLowerCase()
    .replace(/^\s*kec(amatan)?\.?\s*/, '')
    .replace(/[^a-z]/g, '')
}

// Levenshtein distance: the fewest single-letter insertions, deletions or changes from one to the other.
export function editDistance(first: string, second: string) {
  let previous = Array.from({ length: second.length + 1 }, (_, index) => index)
  for (let row = 1; row <= first.length; row++) {
    const current = [row]
    for (let column = 1; column <= second.length; column++) {
      const change = first[row - 1] === second[column - 1] ? 0 : 1
      current[column] = Math.min(
        previous[column] + 1,
        current[column - 1] + 1,
        previous[column - 1] + change
      )
    }
    previous = current
  }
  return previous[second.length]
}
