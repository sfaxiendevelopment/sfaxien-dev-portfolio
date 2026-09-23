import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-media'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  pulse: number
  seed: number
}

/**
 * Lightweight canvas particle field — no Three.js, capped particle count,
 * paused when offscreen or when the tab is hidden, disabled for
 * prefers-reduced-motion.
 */
export function ParticleField({ count = 46, className }: { count?: number; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let particles: Particle[] = []
    let width = 0
    let height = 0
    let visible = true
    let running = true

    const DPR = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = width * DPR
      canvas.height = height * DPR
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
    }

    const initParticles = () => {
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        size: Math.random() * 1.8 + 0.6,
        pulse: Math.random() * Math.PI * 2,
        seed: Math.random() * 6 + 3,
      }))
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        p.pulse += 0.02

        if (p.x < -10) p.x = width + 10
        if (p.x > width + 10) p.x = -10
        if (p.y < -10) p.y = height + 10
        if (p.y > height + 10) p.y = -10

        const alpha = 0.2 + Math.sin(p.pulse) * 0.16

        // Soft halo
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 3.2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(56,189,248,${alpha * 0.18})`
        ctx.fill()

        // Core
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(163,230,253,${alpha})`
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }

    const start = () => {
      if (!running || !visible || reduced) return
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(draw)
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible && running && !reduced) start()
      else cancelAnimationFrame(raf)
    })

    resize()
    initParticles()
    observer.observe(canvas)

    const onVisibility = () => {
      running = !document.hidden
      if (running && visible && !reduced) start()
      else cancelAnimationFrame(raf)
    }
    const onResize = () => {
      resize()
      initParticles()
    }

    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVisibility)
    if (!reduced) start()

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [count, reduced])

  if (reduced) return null

  return <canvas ref={canvasRef} aria-hidden className={className} />
}