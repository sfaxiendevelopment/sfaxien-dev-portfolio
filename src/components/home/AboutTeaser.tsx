import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Reveal } from '@/components/motion/Reveal'
import { SectionHeading } from '@/components/section/SectionHeading'

export function AboutTeaser() {
  return (
    <section className="relative border-t border-border/60 py-24 md:py-28">
      <div className="container grid items-center gap-14 lg:grid-cols-2">
        <div className="relative order-2 lg:order-1">
          <Reveal>
            <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-border/70">
              <div className="relative h-full w-full bg-gradient-to-br from-[#0a0f1e] via-[#0c1430] to-[#131c3a]">
                <div className="bg-grid absolute inset-0 opacity-40" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute inset-x-6 top-6 flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-primary/80">
                  <span>SFX/DEV</span>
                  <span>EST. GLOBAL</span>
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="font-display text-2xl font-semibold leading-snug text-white">
                    Engineering discipline,
                    <br />
                    cinematic delivery.
                  </p>
                  <p className="mt-3 text-sm text-white/60">
                    Four disciplines, one standard: every line ships like it's on show.
                  </p>
                </div>
                <div aria-hidden className="absolute right-6 top-20 h-24 w-24 rounded-full border border-primary/30" />
                <div aria-hidden className="absolute right-12 top-32 h-12 w-12 rounded-full bg-primary/20 blur-xl" />
              </div>
            </div>
          </Reveal>
        </div>

        <div className="order-1 lg:order-2">
          <SectionHeading
            eyebrow="Who is SFAXIEN DEV"
            title={
              <>
                A developer who treats code like a <span className="text-gradient">craft</span>
              </>
            }
            description="I build full-stack platforms, FiveM experiences, games and interfaces with a bias for precision — clean architecture, sharp motion, and interfaces that respect the user."
          />
          <Reveal delay={0.1}>
            <ul className="mt-8 space-y-4">
              {[
                { label: 'Full-Stack Web', detail: 'React · TypeScript · Node · PostgreSQL' },
                { label: 'FiveM Development', detail: 'Resources · scripts · performance-safe Lua' },
                { label: 'Game Development', detail: 'Gameplay systems · Unreal Engine' },
                { label: 'UI/UX Development', detail: 'Design systems · cinematic interfaces' },
              ].map((item) => (
                <li
                  key={item.label}
                  className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-card/60 px-5 py-4"
                >
                  <span className="font-display font-medium text-foreground">{item.label}</span>
                  <span className="text-right font-mono text-xs text-muted-foreground">{item.detail}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="mt-8">
              <Link
                to="/about"
                className="group inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                More about Sfaxien
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}