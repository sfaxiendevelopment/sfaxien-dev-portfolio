import type { Variants } from 'framer-motion'

export const EASE_PREMIUM: [number, number, number, number] = [0.16, 1, 0.3, 1]
export const EASE_SOFT: [number, number, number, number] = [0.25, 0.1, 0.25, 1]
export const EASE_CINEMATIC: [number, number, number, number] = [0.83, 0, 0.17, 1]

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_PREMIUM },
  },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, ease: EASE_SOFT } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: EASE_PREMIUM },
  },
}

export const slideLeft: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE_PREMIUM } },
}

export const slideRight: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE_PREMIUM } },
}

export const staggerContainer = (stagger = 0.1, delayChildren = 0.05): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren },
  },
})

export const letterMask: Variants = {
  hidden: { y: '110%', opacity: 0 },
  visible: {
    y: '0%',
    opacity: 1,
    transition: { duration: 0.85, ease: EASE_CINEMATIC },
  },
}

export const clipReveal: Variants = {
  hidden: { clipPath: 'inset(0 0 100% 0)' },
  visible: {
    clipPath: 'inset(0 0 0% 0)',
    transition: { duration: 1.1, ease: EASE_CINEMATIC },
  },
}

export const viewportOnce = { once: true, margin: '-80px' } as const