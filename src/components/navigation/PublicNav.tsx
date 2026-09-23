import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Wordmark } from '@/components/brand/Logo'
import { PUBLIC_LINKS, useCommandPalette } from '@/components/navigation/links'
import { useScrollPosition, usePrefersReducedMotion } from '@/hooks/use-media'

export function PublicNav() {
  const { y, direction } = useScrollPosition(10)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const reduced = usePrefersReducedMotion()
  const { setOpen } = useCommandPalette()

  const hidden = y > 140 && direction === 'down'
  const scrolled = y > 24

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  return (
    <>
      <AnimatePresence initial={false}>
        {!hidden && (
          <motion.header
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500',
              scrolled ? 'glass-strong border-b border-border/60' : 'border-b border-transparent',
            )}
          >
            <div className="container flex h-16 items-center justify-between">
              <Link to="/" aria-label="SFAXIEN DEV — home" className="shrink-0">
                <Wordmark />
              </Link>

              <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
                {PUBLIC_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) =>
                      cn(
                        'relative rounded-md px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
                        isActive && 'text-foreground',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {link.label}
                        {isActive && (
                          <motion.span
                            layoutId="nav-underline"
                            className="absolute inset-x-3 -bottom-0.5 h-px bg-gradient-to-r from-primary to-accent"
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="hidden items-center gap-2 rounded-md border border-border bg-secondary/30 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground md:flex"
                  aria-label="Open command palette"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span className="text-muted-foreground/70">Search</span>
                  <kbd className="ml-2 rounded border border-border bg-background/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                    ⌘K
                  </kbd>
                </button>

                <Link
                  to="/contact"
                  className="hidden items-center rounded-full border border-border bg-secondary/30 px-5 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary md:flex"
                >
                  Let's talk
                </Link>

                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-secondary/30 text-foreground md:hidden"
                  onClick={() => setMobileOpen((v) => !v)}
                  aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={mobileOpen}
                >
                  {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex flex-col bg-background/95 pt-20 backdrop-blur-xl md:hidden"
          >
            <nav aria-label="Mobile" className="container flex flex-col gap-1 py-6">
              {PUBLIC_LINKS.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={reduced ? false : { opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <NavLink
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) =>
                      cn(
                        'block border-b border-border/40 py-4 font-display text-2xl font-medium tracking-tight text-muted-foreground transition-colors',
                        isActive && 'text-primary',
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                </motion.div>
              ))}
            </nav>
            <div className="container mt-auto pb-10">
              <Link
                to="/contact"
                className="flex items-center justify-center rounded-full bg-primary px-6 py-4 font-medium text-primary-foreground"
              >
                Start a project
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}