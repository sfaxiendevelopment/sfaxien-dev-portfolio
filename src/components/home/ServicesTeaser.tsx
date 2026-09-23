import { Link } from 'react-router-dom'
import { services } from '@/config/site'
import { SectionHeading } from '@/components/section/SectionHeading'
import { StaggerReveal, StaggerItem, Reveal } from '@/components/motion/Reveal'

export function ServicesTeaser() {
  return (
    <section className="relative border-t border-border/60 py-24 md:py-28">
      <div className="container">
        <SectionHeading
          eyebrow="Capabilities"
          title={
            <>
              Services that ship <span className="text-gradient">real products</span>
            </>
          }
          description="Disciplines that compound — engineering, game development and interface design under one roof."
        />

        <StaggerReveal className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, 6).map((service) => {
            const Icon = service.icon
            return (
              <StaggerItem key={service.slug}>
                <Link
                  to="/services"
                  className="group relative block h-full overflow-hidden rounded-xl border border-border/70 bg-card p-7 transition-colors duration-300 hover:border-primary/40"
                >
                  <div aria-hidden className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-secondary/50 text-primary transition-colors group-hover:border-primary/40">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold tracking-tight text-foreground">{service.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{service.blurb}</p>
                  <span className="mt-5 inline-block text-xs font-medium text-primary opacity-0 transition-all duration-300 group-hover:opacity-100">
                    Learn more →
                  </span>
                </Link>
              </StaggerItem>
            )
          })}
        </StaggerReveal>

        <Reveal className="text-center">
          <Link
            to="/services"
            className="mt-12 inline-flex items-center gap-2 rounded-full border border-border px-7 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            Explore all services
          </Link>
        </Reveal>
      </div>
    </section>
  )
}