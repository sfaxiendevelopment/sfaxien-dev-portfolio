import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  eyebrow: string
  title: React.ReactNode
  description?: string
  align?: 'left' | 'center'
  className?: string
}

export function SectionHeading({ eyebrow, title, description, align = 'left', className }: SectionHeadingProps) {
  return (
    <div className={cn(align === 'center' ? 'mx-auto text-center' : '', 'max-w-2xl', className)}>
      <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-primary">
        <span className="h-px w-8 bg-primary/60" aria-hidden />
        {eyebrow}
      </p>
      <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl">
        {title}
      </h2>
      {description && <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">{description}</p>}
    </div>
  )
}