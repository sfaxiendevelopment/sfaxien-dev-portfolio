import { useRef, type ReactNode, type CSSProperties } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'

interface ParallaxProps {
  children: ReactNode
  className?: string
  /** Vertical travel: positive = element moves down slower than scroll */
  offset?: number
  style?: CSSProperties
}

export function Parallax({ children, className, offset = 60, style }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [-offset, offset])

  if (reduced) {
    return (
      <div ref={ref} className={className} style={style}>
        {children}
      </div>
    )
  }

  return (
    <div ref={ref} className={className} style={style}>
      <motion.div style={{ y }} className="will-change-transform">
        {children}
      </motion.div>
    </div>
  )
}