import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/motion/Reveal'
import { ParticleField } from '@/components/hero/ParticleField'

export function CtaBand() {
  return (
    <section className="relative overflow-hidden py-28 md:py-36">
      <div aria-hidden className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.05] to-transparent" />
        <div className="absolute left-1/2 top-1/2 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[130px]" />
        <div className="bg-grid absolute inset-0 opacity-30" />
        <ParticleField count={26} className="absolute inset-0 h-full w-full opacity-70" />
      </div>

      <div className="container relative z-10">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">Let's build together</p>
          <h2 className="mt-5 font-display text-4xl font-bold leading-tight tracking-tight text-foreground md:text-6xl">
            Have a project in mind?
            <br />
            <span className="text-gradient">Let's make it happen.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            From a full web platform to a FiveM server or a game experience — tell me what you're
            building and I'll bring senior engineering to it.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/contact"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-[0_0_30px_-8px_hsl(var(--primary)/0.7)] transition-shadow hover:shadow-[0_0_44px_-8px_hsl(var(--primary)/0.9)]"
            >
              Start a project
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center rounded-full border border-border px-8 py-4 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              About me
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}