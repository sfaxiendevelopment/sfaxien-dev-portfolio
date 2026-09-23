import type { ElementType } from 'react'
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion'
import { fadeUp, viewportOnce } from '@/animations/variants'

interface RevealProps extends HTMLMotionProps<'div'> {
  as?: 'div' | 'section' | 'span' | 'li'
  delay?: number
  y?: number
}

export function Reveal({ as = 'div', delay = 0, y = 28, children, ...rest }: RevealProps) {
  const reduced = useReducedMotion()
  const Tag = motion[as] as ElementType

  if (reduced) {
    return <motion.div initial={false}>{children}</motion.div>
  }

  return (
    <Tag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

export function StaggerReveal({
  children,
  className,
  stagger = 0.12,
  ...rest
}: { children: React.ReactNode; className?: string; stagger?: number } & HTMLMotionProps<'div'>) {
  const reduced = useReducedMotion()

  if (reduced) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className,
  ...rest
}: { children: React.ReactNode; className?: string } & HTMLMotionProps<'div'>) {
  const reduced = useReducedMotion()
  if (reduced) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

export { fadeUp }