import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function SidebarSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="px-3 pb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">{label}</p>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

export function SidebarLink({
  to,
  icon,
  label,
  trailing,
  end,
}: {
  to: string
  icon: ReactNode
  label: string
  trailing?: ReactNode
  end?: boolean
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary/15 text-primary'
            : 'text-muted-foreground hover:bg-accent/10 hover:text-accent',
        )
      }
    >
      <span className="shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
      {trailing}
    </NavLink>
  )
}

export function SidebarItem({ active, children }: { active?: boolean; children: ReactNode }) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium',
        active ? 'bg-primary/15 text-primary' : 'text-muted-foreground',
      )}
    >
      {children}
    </div>
  )
}