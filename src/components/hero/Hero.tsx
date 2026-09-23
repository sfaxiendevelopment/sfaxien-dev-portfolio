import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ArrowRight, ArrowDown, ExternalLink } from 'lucide-react'
import { site } from '@/config/site'
import { ParticleField } from '@/components/hero/ParticleField'
import { OptimizedImage } from '@/components/media/OptimizedImage'
import { useFeaturedProjects } from '@/hooks/use-projects'
import { EASE_CINEMATIC } from '@/animations/variants'
import { statusLabel } from '@/components/projects/ProjectCard'
import { Badge } from '@/components/ui/badge'

function useMouseTilt() {
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 60, damping: 16 })
  const sy = useSpring(my, { stiffness: 60, damping: 16 })
  const rotateY = useTransform(sx, [-1, 1], [-6, 6])
  const rotateX = useTransform(sy, [-1, 1], [6, -6])
  const translateY = useTransform(sy, [-1, 1], [10, -10])
  return { mx, my, rotateX, rotateY, translateY }
}

function RoleCycler() {
  const [index, setIndex] = useState(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % site.roles.length), 3200)
    return () => clearInterval(timer)
  }, [reduced])

  return (
    <span className="relative inline-flex h-[1.15em] overflow-hidden align-baseline">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={site.roles[index]}
          initial={reduced ? false : { y: '110%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={reduced ? undefined : { y: '-110%', opacity: 0 }}
          transition={{ duration: 0.55, ease: EASE_CINEMATIC }}
          className="inline-block whitespace-nowrap text-gradient font-display font-semibold"
        >
          {site.roles[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export function Hero() {
  const { data, isLoading } = useFeaturedProjects(1)
  const featured = data?.data?.[0] ?? null
  const reduced = useReducedMotion()
  const { mx, my, rotateX, rotateY, translateY } = useMouseTilt()

  const onMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (reduced) return
    const rect = e.currentTarget.getBoundingClientRect()
    mx.set(((e.clientX - rect.left) / rect.width) * 2 - 1)
    my.set(((e.clientY - rect.top) / rect.height) * 2 - 1)
  }

  return (
    <section
      onMouseMove={onMouseMove}
      className="grain-overlay relative flex min-h-[100svh] items-center overflow-hidden pt-24 pb-20"
    >
      {/* Backdrop */}
      <div aria-hidden className="absolute inset-0">
        <div className="bg-grid mask-fade-b absolute inset-0 opacity-[0.5]" />
        <div className="absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />
        <div className="absolute right-[-10%] top-1/3 h-[380px] w-[380px] rounded-full bg-accent/10 blur-[120px]" />
        <ParticleField className="absolute inset-0 h-full w-full" />
      </div>

      <div className="container relative z-10 grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Copy */}
        <div>
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.24em] text-primary"
          >
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary" />
            Available for new projects
          </motion.p>

          <motion.h1
            initial={reduced ? false : { opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: EASE_CINEMATIC }}
            className="mt-6 font-display text-[2.8rem] font-bold leading-[0.95] tracking-tight text-foreground sm:text-6xl md:text-7xl"
          >
            SFAXIEN
            <br />
            <span className="text-gradient">DEV</span>
          </motion.h1>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.28, ease: EASE_CINEMATIC }}
            className="mt-6 font-display text-xl font-medium text-foreground/90 sm:text-2xl"
          >
            <RoleCycler />
          </motion.div>

          <motion.p
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: EASE_CINEMATIC }}
            className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg"
          >
            I design and engineer digital products with cinematic attention to detail — from
            full-stack web platforms to FiveM servers, games, and interfaces built to feel expensive.
          </motion.p>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.52, ease: EASE_CINEMATIC }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <motion.span whileHover={reduced ? undefined : { scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/projects"
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_0_28px_-6px_hsl(var(--primary)/0.6)] transition-shadow hover:shadow-[0_0_40px_-6px_hsl(var(--primary)/0.8)]"
              >
                View My Work
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.span>
            <motion.span whileHover={reduced ? undefined : { scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/30 px-7 py-3.5 text-sm font-semibold text-foreground backdrop-blur-sm transition-colors hover:border-primary/50 hover:text-primary"
              >
                Contact Me
              </Link>
            </motion.span>
          </motion.div>
        </div>

        {/* Featured visual */}
        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.94, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.35, ease: EASE_CINEMATIC }}
          className="relative mx-auto w-full max-w-xl"
          style={{ perspective: 1200 }}
        >
          <motion.div
            style={reduced ? undefined : { rotateX, rotateY, transformPerspective: 1200 }}
            className="relative"
          >
            {/* Glow ring */}
            <div aria-hidden className="absolute -inset-6 rounded-[28px] bg-gradient-to-tr from-primary/20 via-transparent to-accent/20 blur-2xl" />

            <div className="glass relative overflow-hidden rounded-2xl border border-border/80 shadow-2xl">
              {isLoading || !featured ? (
                <div className="relative aspect-[4/3] overflow-hidden">
                  <div className="bg-grid absolute inset-0 opacity-40" />
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <span className="font-display text-xl font-semibold text-foreground/80">Featured Work</span>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">New case studies coming soon</p>
                  </div>
                </div>
              ) : (
                <motion.div style={reduced ? undefined : { y: translateY }}>
                  <Link to={`/projects/${featured.slug}`} className="group relative block">
                    <OptimizedImage
                      src={featured.hero_image || featured.thumbnail}
                      alt={featured.title}
                      width={1100}
                      className="aspect-[4/3]"
                      imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      eager
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute inset-x-5 bottom-5 flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                          {featured.category?.name ?? 'Frontend Project'}
                        </p>
                        <h3 className="mt-1 font-display text-xl font-semibold text-white">{featured.title}</h3>
                        <span className="mt-2 inline-flex items-center gap-1.5 text-xs text-white/80 group-hover:text-primary">
                          <ExternalLink className="h-3.5 w-3.5" /> View case study
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {featured.is_demo && <Badge variant="demo">Demo</Badge>}
                        <span className="rounded-full border border-white/20 bg-black/40 px-2.5 py-0.5 text-[11px] text-white/90 backdrop-blur">
                          {statusLabel(featured.status)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}

              <div className="flex items-center justify-between border-t border-border/70 px-5 py-3.5">
                <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  {featured ? 'Latest featured project' : 'SFAXIEN.DEV — ' + new Date().getFullYear()}
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> live no-downtime philosophy
                </span>
              </div>
            </div>

            {/* Floating metadata chips */}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.9, ease: EASE_CINEMATIC }}
              className="absolute -right-4 top-8 hidden rounded-xl border border-border/70 bg-popover/90 px-4 py-3 backdrop-blur-md sm:block"
            >
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Stack</p>
              <p className="mt-1 text-sm font-medium text-foreground">React · TypeScript · PostgreSQL</p>
            </motion.div>
            <motion.div
              initial={reduced ? false : { opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.05, ease: EASE_CINEMATIC }}
              className="absolute -left-5 bottom-20 hidden rounded-xl border border-border/70 bg-popover/90 px-4 py-3 backdrop-blur-md sm:block"
            >
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Disciplines</p>
              <p className="mt-1 text-sm font-medium text-foreground">Full-Stack · FiveM · Game · UI/UX</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      {!reduced && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
          aria-hidden
        >
          <Link to="/projects" className="flex flex-col items-center gap-2 text-muted-foreground transition-colors hover:text-primary">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em]">Scroll</span>
            <motion.span animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}>
              <ArrowDown className="h-4 w-4" />
            </motion.span>
          </Link>
        </motion.div>
      )}
    </section>
  )
}

// Re-export for reuse in other heroes
export function HeroEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-primary">
      <span className="h-px w-8 bg-primary/60" aria-hidden />
      {children}
    </p>
  )
}