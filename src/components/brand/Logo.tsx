import { cn } from '@/lib/utils'

export function LogoMark({ className }: { className?: string }) {
  return (
    <img
      src="/avatar.png"
      alt="SFAXIEN DEV logo"
      className={cn('h-8 w-8 rounded-full object-cover', className)}
      loading="eager"
      decoding="async"
    />
  )
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <LogoMark />
      <span className="font-display text-base font-semibold tracking-wide text-foreground">
        SFAXIEN<span className="text-primary">.DEV</span>
      </span>
    </span>
  )
}