import { useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  strength?: number
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
  type?: 'button' | 'submit'
  ariaLabel?: string
  disabled?: boolean
}

export function MagneticButton({
  children,
  className,
  strength = 0.35,
  onClick,
  type = 'button',
  ariaLabel,
  disabled,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const reduced = useReducedMotion()

  const handleMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (reduced || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) * strength
    const y = (e.clientY - rect.top - rect.height / 2) * strength
    setOffset({ x, y })
  }

  const reset = () => setOffset({ x: 0, y: 0 })

  return (
    <motion.button
      ref={ref}
      type={type}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      className={className}
    >
      {children}
    </motion.button>
  )
}