import { Link } from 'react-router-dom'
import Seo from '@/components/seo/Seo'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <>
      <Seo title="404 — Page not found" path="/404" noIndex />
      <section className="container flex min-h-[70vh] items-center justify-center pb-20 pt-32">
        <div className="max-w-lg text-center">
          <p className="font-mono text-sm uppercase tracking-[0.3em] text-primary">404</p>
          <h1 className="mt-5 font-display text-5xl font-bold tracking-tight text-foreground md:text-7xl">
            Lost in <span className="text-gradient">the stack</span>
          </h1>
          <p className="mx-auto mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground md:text-base">
            That page doesn't exist or has been moved. The good news — the rest of the site is fully built.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild>
              <Link to="/">Back home</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/projects">View projects</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}