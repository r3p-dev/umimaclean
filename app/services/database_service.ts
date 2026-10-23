export function isUniqueViolation(error: unknown) {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return false
  }

  return String(error.code) === '23505'
}
