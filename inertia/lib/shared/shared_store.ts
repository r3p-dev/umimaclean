import { useSyncExternalStore } from 'react'
import { readStore, writeStore } from '~/lib/shared/storage'

type Area = 'session' | 'local'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function createSharedStore<T>(area: Area, key: string, initial: () => T) {
  let cache: T | undefined
  const listeners = new Set<() => void>()

  function get(): T {
    if (cache === undefined) {
      const fresh = initial()
      const stored = readStore<T>(area, key)
      cache =
        stored === null
          ? fresh
          : isRecord(fresh) && isRecord(stored)
            ? { ...fresh, ...stored }
            : stored
    }
    return cache
  }

  function set(update: T | ((current: T) => T)) {
    cache = typeof update === 'function' ? (update as (current: T) => T)(get()) : update
    writeStore(area, key, cache)
    for (const listener of listeners) {
      listener()
    }
  }

  function reset() {
    set(initial())
  }

  function subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }

  function use() {
    return useSyncExternalStore(subscribe, get, get)
  }

  return { get, set, reset, use }
}
