import { useCallback, useEffect, useRef, useState } from 'react'

function slidesOf(track: HTMLElement) {
  return [...track.children] as HTMLElement[]
}

function offsetOf(slides: HTMLElement[], index: number) {
  return slides[index].offsetLeft - slides[0].offsetLeft
}

export function useSnapCarousel<T extends HTMLElement>(count: number) {
  const ref = useRef<T>(null)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const track = ref.current
    if (!track) return
    let frame = 0

    function update() {
      frame = 0
      if (!track) return
      const slides = slidesOf(track)
      if (!slides.length) return
      if (track.scrollLeft >= track.scrollWidth - track.clientWidth - 2) {
        setIndex(slides.length - 1)
        return
      }
      let nearest = 0
      slides.forEach((_, slide) => {
        const distance = Math.abs(offsetOf(slides, slide) - track.scrollLeft)
        if (distance < Math.abs(offsetOf(slides, nearest) - track.scrollLeft)) nearest = slide
      })
      setIndex(nearest)
    }

    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update)
    }

    track.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      track.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [count])

  const scrollTo = useCallback((target: number) => {
    const track = ref.current
    if (!track) return
    const slides = slidesOf(track)
    const next = Math.max(0, Math.min(slides.length - 1, target))
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    track.scrollTo({ left: offsetOf(slides, next), behavior: reduce ? 'auto' : 'smooth' })
  }, [])

  return {
    ref,
    index,
    scrollTo,
    previous: () => scrollTo(index - 1),
    next: () => scrollTo(index + 1),
    atStart: index <= 0,
    atEnd: index >= count - 1,
  }
}
