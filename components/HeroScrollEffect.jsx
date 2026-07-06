'use client'

import { useEffect } from 'react'

// Sets --hero-progress (0 → 1) on the hero section as it scrolls out of
// view. CSS consumes it for the parallax transform (see globals.css).
// Renders nothing; does nothing when the user prefers reduced motion.
export default function HeroScrollEffect({ targetId }) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const el = document.getElementById(targetId)
    if (!el) return

    let raf = 0
    const update = () => {
      raf = 0
      const progress = Math.min(1, Math.max(0, window.scrollY / Math.max(1, el.offsetHeight)))
      el.style.setProperty('--hero-progress', progress.toFixed(4))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [targetId])

  return null
}
