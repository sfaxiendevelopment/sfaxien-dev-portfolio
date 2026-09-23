import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react'
import Seo from '@/components/seo/Seo'
import { SectionHeading } from '@/components/section/SectionHeading'
import { Reveal, StaggerReveal, StaggerItem } from '@/components/motion/Reveal'
import { services } from '@/config/site'

export default function Services() {
  return (
    <>
      <Seo
        title="Services — Web · FiveM · Games · UI/UX"
        description="Full-stack web platforms, FiveM resources and servers, game development and cinematic UI/UX. Senior-grade delivery across four disciplines."
        path="/services"
      />

      <section className="container pb-8 pt-28 md:pt-36">
        <SectionHeading
          eyebrow="Services"
          title={
            <>
              What I can <span className="text-gradient">build for you</span>
            </>
          }
          description="Four disciplines, one standard. Every engagement is structured, documented and delivered like a senior engineer's work — because that's exactly what it is."
        />

        <StaggerReveal className="mt-14 grid gap-6 md:grid-cols-2">
          {services.map((service) => {
            const Icon = service.icon
            return (
              <StaggerItem key={service.slug}>
                <article className="group relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card p-8 transition-colors hover:border-primary/40 md:p-10">
                  <div aria-hidden className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-secondary/50 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                      {String(services.indexOf(service) + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h2 className="mt-6 font-display text-2xl font-semibold tracking-tight text-foreground">
                    {service.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                    {service.description}
                  </p>
                  <ul className="mt-6 grid gap-2.5">
                    {service.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-foreground/85">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/contact"
                    className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-primary"
                  >
                    Discuss this service
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </article>
              </StaggerItem>
            )
          })}
        </StaggerReveal>
      </section>

      <section className="border-t border-border/60 py-20 md:py-24">
        <div className="container max-w-3xl text-center">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">Process</p>
            <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl">
              From brief to build, <span className="text-gradient">without surprises</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              Discovery — scope & estimate — build in visible milestones — review & iterate — handoff with
              documentation. You always know what is happening and what's next.
            </p>
            <Link
              to="/contact"
              className="group mt-10 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-[0_0_30px_-8px_hsl(var(--primary)/0.7)] transition-shadow hover:shadow-[0_0_44px_-8px_hsl(var(--primary)/0.9)]"
            >
              Start the process
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}