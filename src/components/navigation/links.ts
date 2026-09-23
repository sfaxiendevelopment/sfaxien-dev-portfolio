import { useEffect, useState } from 'react'

export const PUBLIC_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/projects', label: 'Projects' },
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/contact', label: 'Contact' },
] as const

interface CommandPaletteItem {
  id: string
  label: string
  group: string
  path: string
  keywords?: string[]
}

export const COMMAND_ITEMS: CommandPaletteItem[] = [
  { id: 'home', label: 'Go Home', group: 'Navigate', path: '/', keywords: ['home', 'start'] },
  { id: 'projects', label: 'Projects', group: 'Navigate', path: '/projects', keywords: ['work', 'portfolio', 'case'] },
  { id: 'about', label: 'About', group: 'Navigate', path: '/about', keywords: ['info', 'bio'] },
  { id: 'services', label: 'Services', group: 'Navigate', path: '/services', keywords: ['offer', 'development'] },
  { id: 'contact', label: 'Contact', group: 'Navigate', path: '/contact', keywords: ['email', 'reach'] },
  { id: 'search', label: 'Search Projects', group: 'Actions', path: '/projects?q=', keywords: ['find', 'search'] },
]

// NOTE: /admin-sec is intentionally absent here.

export function useCommandPalette() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', down)
    return () => window.removeEventListener('keydown', down)
  }, [])

  return { open, setOpen }
}