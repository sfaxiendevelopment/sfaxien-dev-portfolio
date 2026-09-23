import type { ReactNode } from 'react'
import { Reveal } from '@/components/motion/Reveal'
import { cn } from '@/lib/utils'

export function CaseSection({
  index,
  eyebrow,
  title,
  children,
  className,
}: {
  index?: string
  eyebrow: string
  title: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('relative', className)}>
      <Reveal>
        <div className="max-w-3xl">
          <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-primary">
            <span className="h-px w-8 bg-primary/60" aria-hidden />
            {index ? `${index} · ${eyebrow}` : eyebrow}
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl">
            {title}
          </h2>
        </div>
        <div className="mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">{children}</div>
      </Reveal>
    </section>
  )
}

export function ProseList({ items }: { items: string }) {
  const lines = items
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  if (lines.length === 0) return null

  const isBulleted = lines.every((l) => l.startsWith('-'))
  if (isBulleted || lines.length > 2) {
    return (
      <ul className="mt-4 space-y-3">
        {lines.map((line, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
            <span>{line.replace(/^-\s*/, '')}</span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="space-y-4 whitespace-pre-line">
      {lines.map((line, i) => (
        <p key={i}>{line}</p>
      ))}
    </div>
  )
}