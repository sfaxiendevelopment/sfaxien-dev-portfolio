import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Laptop, Gamepad2, Network, Palette } from 'lucide-react'
import Seo from '@/components/seo/Seo'
import { SectionHeading } from '@/components/section/SectionHeading'
import { Reveal, StaggerReveal, StaggerItem } from '@/components/motion/Reveal'
import { cn } from '@/lib/utils'
import { technologies } from '@/config/site'

const journey = [
  {
    period: 'Early Days',
    role: 'Where it started',
    description:
      'Soldered my first scripts and hacked together my first interfaces — the phase where curiosity beat talent.',
    highlights: ['First game mods', 'First UI experiments', 'Learned the value of clean code'],
  },
  {
    period: 'Web Engineering',
    role: 'Full-stack foundation',
    description:
      'Pushed into production web work — real users, real data, real edge cases. React and TypeScript became second nature.',
    highlights: ['Full-stack platforms', 'API design & data modeling', 'Performance & SEO'],
  },
  {
    period: 'FiveM Era',
    role: 'Server-side expertise',
    description:
      'Built and maintained FiveM resources end-to-end: es_extended, ox_lib, boostv2, qbcore — with performance and stability as the baseline.',
    highlights: ['Custom resources & scripts', 'Framework integrations', 'Performance profiling'],
  },
  {
    period: 'Game Development',
    role: 'Designing gameplay',
    description:
      'Crossed into Unreal Engine — gameplay systems, game engines and the craft of making interactions feel responsive.',
    highlights: ['Unreal Engine mechanics', 'Gameplay systems design', 'Engine-level debugging'],
  },
  {
    period: 'UI/UX Development',
    role: 'The finish layer',
    description:
      'Where the two worlds meet. Cinematic interfaces, motion design and design systems that make products feel premium.',
    highlights: ['Design systems', 'Motion & micro-interactions', 'Figma-to-deployed handoffs'],
  },
  {
    period: 'Today',
    role: 'Ship complete products',
    description:
      'One developer, four disciplines. From database schema to the last millisecond of an animation — ownership at every layer.',
    highlights: ['Senior-grade delivery', 'Documented case studies', 'Client-ready communication'],
  },
]

const disciplines = [
  { icon: Laptop, title: 'Web Development', note: 'React · TypeScript · Node.js · PostgreSQL · Tailwind CSS' },
  { icon: Network, title: 'FiveM Development', note: 'Lua · es_extended · ox_lib · qbcore · performance-safe resources' },
  { icon: Gamepad2, title: 'Game Development', note: 'Unreal Engine · gameplay systems · C++/BP' },
  { icon: Palette, title: 'UI/UX Development', note: 'Design systems · motion design · Figma · accessibility' },
]

export default function About() {
  const [active, setActive] = useState(journey.length - 1)

  return (
    <>
      <Seo
        title="About — SFAXIEN DEV"
        description="Full-stack web engineer, FiveM developer, game developer and UI/UX developer. One developer, four disciplines, senior-grade delivery."
        path="/about"
      />

      <section className="container pb-16 pt-28 md:pt-36">
        <SectionHeading
          eyebrow="About SFAXIEN DEV"
          title={
            <>
              One developer,
              <br />
              <span className="text-gradient">four disciplines.</span>
            </>
          }
          description="SFAXIEN DEV is a full-stack engineer and experience builder — shipping web platforms, FiveM experiences, games and interfaces with the same standard: precise, performant, premium."
        />

        <StaggerReveal className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {disciplines.map((d) => {
            const Icon = d.icon
            return (
              <StaggerItem key={d.title}>
                <div className="h-full rounded-xl border border-border/70 bg-card p-6 transition-colors hover:border-primary/40">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary/50 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-display font-semibold tracking-tight text-foreground">{d.title}</h3>
                  <p className="mt-2 font-mono text-xs leading-relaxed text-muted-foreground">{d.note}</p>
                </div>
              </StaggerItem>
            )
          })}
        </StaggerReveal>
      </section>

      {/* Journey timeline */}
      <section className="border-t border-border/60 py-20 md:py-28">
        <div className="container grid gap-12 lg:grid-cols-[280px_1fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading
              eyebrow="Journey"
              title={
                <>
                  The road so <span className="text-gradient">far</span>
                </>
              }
              description="Select a milestone to walk through how the disciplines came together."
            />
            <div className="mt-8 flex gap-2 lg:flex-col">
              {journey.map((step, i) => (
                <button
                  key={step.period}
                  type="button"
                  onClick={() => setActive(i)}
                  className={cn(
                    'rounded-full border px-4 py-2 text-sm font-medium transition-colors lg:w-fit lg:rounded-lg',
                    active === i
                      ? 'border-primary/60 bg-primary/15 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
                  )}
                >
                  {step.period}
                </button>
              ))}
            </div>
          </div>

          <Reveal key={active}>
            <div className="rounded-2xl border border-border/70 bg-card p-8 md:p-12">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-primary">
                {journey[active].period} — Milestone {String(active + 1).padStart(2, '0')}
              </p>
              <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                {journey[active].role}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                {journey[active].description}
              </p>
              <ul className="mt-6 space-y-3">
                {journey[active].highlights.map((h) => (
                  <li key={h} className="flex items-center gap-3 text-sm text-foreground/85">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Toolbox */}
      <section className="border-t border-border/60 py-20 md:py-28">
        <div className="container">
          <SectionHeading
            eyebrow="Toolbox"
            title={
              <>
                Tools I reach for, <span className="text-gradient">daily</span>
              </>
            }
          />
          <div className="mt-10 flex flex-wrap gap-2.5">
            {technologies.map((t) => (
              <span
                key={t.slug}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                {t.name}
              </span>
            ))}
          </div>
          <Reveal className="mt-14 text-center">
            <Link
              to="/contact"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-[0_0_30px_-8px_hsl(var(--primary)/0.7)] transition-shadow hover:shadow-[0_0_44px_-8px_hsl(var(--primary)/0.9)]"
            >
              Let's work together
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}