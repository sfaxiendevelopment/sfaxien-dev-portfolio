import { site } from '@/config/site'
import { usePrefersReducedMotion } from '@/hooks/use-media'

export function TechMarquee() {
  const reduced = usePrefersReducedMotion()
  const items = [...site.roles, ...site.roles]

  if (reduced) {
    return (
      <div className="overflow-hidden border-y border-border/60 py-6">
        <div className="container flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
          {site.roles.map((r) => (
            <span key={r} className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
              {r}
            </span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div aria-hidden className="relative overflow-hidden border-y border-border/60 py-7">
      <div className="mask-fade-x flex w-max animate-marquee items-center gap-10">
        {items.map((role, i) => (
          <span key={`${role}-${i}`} className="flex items-center gap-10">
            <span className="font-display text-lg font-medium tracking-wide text-foreground/60">{role}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
          </span>
        ))}
      </div>
    </div>
  )
}