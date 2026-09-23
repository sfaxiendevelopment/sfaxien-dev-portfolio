import { Link } from 'react-router-dom'
import { Mail, MessageCircle } from 'lucide-react'
import { site } from '@/config/site'
import { PUBLIC_LINKS } from '@/components/navigation/links'
import { LogoMark } from '@/components/brand/Logo'
import { GithubIcon } from '@/components/brand/GithubIcon'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative border-t border-border/60 bg-background">
      <div className="container grid gap-10 py-16 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <Link to="/" aria-label="SFAXIEN DEV — home" className="inline-flex items-center gap-2.5">
            <LogoMark className="h-7 w-7" />
            <span className="font-display text-base font-semibold tracking-wide text-foreground">
              SFAXIEN<span className="text-primary">.DEV</span>
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">{site.tagline}</p>
          <div className="mt-6 flex items-center gap-3">
            <a
              href={site.socials.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              <GithubIcon className="h-4 w-4" />
            </a>
            <a
              href={`mailto:${site.email}`}
              aria-label="Email"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              <Mail className="h-4 w-4" />
            </a>
            <a
              href={site.socials.discord}
              target="_blank"
              rel="noreferrer"
              aria-label="Discord"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
        </div>

        <nav aria-label="Footer">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Explore</h3>
          <ul className="mt-4 space-y-2.5">
            {PUBLIC_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Contact</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li>
              <a href={`mailto:${site.email}`} className="transition-colors hover:text-primary">
                {site.email}
              </a>
            </li>
            <li>{site.location}</li>
            <li className="text-muted-foreground/80">Full-Stack · FiveM · Game · UI/UX</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="container flex flex-col items-center justify-between gap-3 py-5 text-xs text-muted-foreground sm:flex-row">
          <p>© {year} {site.legalName}. All rights reserved.</p>
          <p className="font-mono tracking-wider">
            DESIGNED &amp; BUILT BY <span className="text-primary">SFAXIEN DEV</span>
          </p>
        </div>
      </div>
    </footer>
  )
}