import { useEffect, type RefObject } from 'react'
import { router } from '@inertiajs/react'

const MM_PER_PX = 25.4 / 96

export type Store = { name: string; whatsapp: string; address: string; hours: string }

export function usePaperLength(sheet: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const style = document.createElement('style')
    document.head.append(style)
    const fit = () => {
      const length = Math.ceil((sheet.current?.offsetHeight ?? 0) * MM_PER_PX) + 2
      style.textContent = `@page { size: 58mm ${length}mm; margin: 0 }`
    }
    const observer = new ResizeObserver(fit)
    if (sheet.current) {
      observer.observe(sheet.current)
    }
    window.addEventListener('beforeprint', fit)
    return () => {
      observer.disconnect()
      window.removeEventListener('beforeprint', fit)
      style.remove()
    }
  }, [sheet])
}

export function goBack(fallback: string) {
  if (window.history.length > 1) {
    window.history.back()
  } else {
    router.visit(fallback)
  }
}
