import { useEffect, useRef, useState } from 'react'

// Animates a number from 0 to `target` using easeOutCubic.
// Re-triggers automatically whenever `target` changes.
export function useCountUp(target: number, duration = 900) {
  const [current, setCurrent] = useState(0)
  const raf = useRef<number>()
  const startTs = useRef<number>()

  useEffect(() => {
    setCurrent(0)
    startTs.current = undefined
    if (raf.current) cancelAnimationFrame(raf.current)

    if (target === 0) return

    function tick(ts: number) {
      if (!startTs.current) startTs.current = ts
      const p = Math.min((ts - startTs.current) / duration, 1)
      const eased = 1 - (1 - p) ** 3        // easeOutCubic
      setCurrent(target * eased)
      if (p < 1) raf.current = requestAnimationFrame(tick)
      else setCurrent(target)
    }

    raf.current = requestAnimationFrame(tick)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [target, duration])

  return current
}
