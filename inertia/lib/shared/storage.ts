type Area = 'session' | 'local'

function store(area: Area) {
  return area === 'session' ? window.sessionStorage : window.localStorage
}

export function readStore<T>(area: Area, key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = store(area).getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function writeStore(area: Area, key: string, value: unknown) {
  if (typeof window === 'undefined') return
  try {
    if (value === null) store(area).removeItem(key)
    else store(area).setItem(key, JSON.stringify(value))
  } catch {}
}
