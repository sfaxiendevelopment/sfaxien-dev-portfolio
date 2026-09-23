import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Play, ExternalLink, Calendar, User } from 'lucide-react'
import { GithubIcon } from '@/components/brand/GithubIcon'
import Seo from '@/components/seo/Seo'
import { usePublishedProject, useProjects } from '@/hooks/use-projects'
import { OptimizedImage } from '@/components/media/OptimizedImage'
import { CaseSection, ProseList } from '@/components/case-study/CaseSection'
import { MediaLightbox } from '@/components/case-study/MediaLightbox'
import { ProjectCard, statusLabel } from '@/components/projects/ProjectCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Reveal } from '@/components/motion/Reveal'
import { getVideoUrl, getMediaUrl } from '@/lib/media'
import { useState } from 'react'
import { EmptyState } from '@/components/shared/StateCards'

function HeroSkeleton() {
  return (
    <section className="container pb-10 pt-24 md:pt-32">
      <Skeleton className="mb-8 h-5 w-32" />
      <Skeleton className="aspect-[16/8] w-full rounded-2xl" />
      <div className="mt-8 space-y-3">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-5 w-1/2" />
      </div>
    </section>
  )
}

export default function ProjectDetails() {
  const { slug } = useParams<{ slug: string }>()
  const [lightbox, setLightbox] = useState<number | null>(null)
  const { data, isLoading, error } = usePublishedProject(slug ?? '')

  const project = data?.data ?? null

  const related = useProjects({ categorySlug: project?.category?.slug ?? undefined })

  if (isLoading) {
    return (
      <>
        <Seo title="Loading…" path={`/projects/${slug ?? ''}`} />
        <HeroSkeleton />
      </>
    )
  }

  if (error || !project) {
    return (
      <>
        <Seo title="Project not found" path={`/projects/${slug ?? ''}`} noIndex />
        <section className="container flex min-h-[60vh] items-center justify-center pb-20 pt-32">
          <div className="max-w-md text-center">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">404 — Case Study</p>
            <h1 className="mt-4 font-display text-3xl font-semibold text-foreground">
              {data?.error === 'Project not found.' ? "We couldn't find that case study." : 'Something went wrong.'}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              {data?.error === 'Project not found.'
                ? 'The project may have been unpublished or moved.'
                : 'Please try again in a moment.'}
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button variant="outline" asChild>
                <Link to="/projects">
                  <ArrowLeft className="h-4 w-4" /> All projects
                </Link>
              </Button>
              <Button asChild>
                <Link to="/contact">Contact me</Link>
              </Button>
            </div>
          </div>
        </section>
      </>
    )
  }

  const hasBody = Boolean(
    project.description ||
      project.problem ||
      project.solution ||
      project.architecture ||
      project.features ||
      project.challenges ||
      project.results,
  )
  const primaryVideo = project.video_url || project.videos[0]?.url || null
  const relatedProjects = (related.data?.data ?? []).filter((p) => p.id !== project.id).slice(0, 3)

  const gallery = project.images.map((img) => ({ url: img.url, caption: img.caption }))

  return (
    <>
      <Seo
        title={project.title}
        description={project.short_description || project.description.slice(0, 150)}
        path={`/projects/${project.slug}`}
        image={project.hero_image || project.thumbnail}
        type="article"
      />

      <article>
        {/* Back link */}
        <div className="container pt-24 md:pt-28">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> All projects
          </Link>
        </div>

        {/* Hero */}
        <header className="container mt-8 pb-12">
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl border border-border/70">
              <OptimizedImage
                src={project.hero_image || project.thumbnail}
                alt={project.title}
                width={1600}
                className="aspect-[16/8] sm:aspect-[16/7]"
                eager
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
                <div className="flex flex-wrap items-center gap-2">
                  {project.category && <Badge variant="secondary">{project.category.name}</Badge>}
                  {project.is_demo && <Badge variant="demo">Demo Project</Badge>}
                  {project.status && <Badge variant="secondary">{statusLabel(project.status)}</Badge>}
                </div>
                <h1 className="mt-4 max-w-3xl font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
                  {project.title}
                </h1>
                {project.short_description && (
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
                    {project.short_description}
                  </p>
                )}
                <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-white/70">
                  {project.year && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" /> {project.year}
                    </span>
                  )}
                  {project.client && (
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" /> {project.client}
                    </span>
                  )}
                  {(project.live_url || project.github_url) && (
                    <span className="flex items-center gap-3">
                      {project.live_url && (
                        <a
                          href={project.live_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3.5 py-1.5 font-medium text-white backdrop-blur transition-colors hover:bg-white/20"
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> Live Demo
                        </a>
                      )}
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3.5 py-1.5 font-medium text-white backdrop-blur transition-colors hover:bg-white/20"
                        >
                          <GithubIcon className="h-3.5 w-3.5" /> Source
                        </a>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        </header>

        {/* Body sections */}
        <div className="space-y-16 pb-20 md:space-y-24 md:pb-28">
          {project.description && (
            <CaseSection index="01" eyebrow="Overview" title="Overview">
              <div className="whitespace-pre-line text-base leading-relaxed text-muted-foreground md:text-lg">
                {project.description}
              </div>
            </CaseSection>
          )}

          {project.problem && (
            <CaseSection index="02" eyebrow="Problem" title="The problem">
              <ProseList items={project.problem} />
            </CaseSection>
          )}

          {project.solution && (
            <CaseSection index="03" eyebrow="Solution" title="The approach">
              <ProseList items={project.solution} />
            </CaseSection>
          )}

          {project.features && (
            <CaseSection index="04" eyebrow="Features" title="Key features">
              <ProseList items={project.features} />
            </CaseSection>
          )}

          {project.architecture && (
            <CaseSection index="05" eyebrow="Architecture" title="Architecture">
              <ProseList items={project.architecture} />
            </CaseSection>
          )}

          {/* Technology */}
          {project.technologies.length > 0 && (
            <section>
              <Reveal>
                <div className="max-w-3xl">
                  <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-primary">
                    <span className="h-px w-8 bg-primary/60" aria-hidden />
                    06 · Technology
                  </p>
                  <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                    Built with
                  </h2>
                  <div className="mt-6 flex flex-wrap gap-2.5">
                    {project.technologies.map((tech) => (
                      <Link
                        key={tech.id}
                        to={`/projects?category=&tech=${tech.slug}`}
                        className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary"
                      >
                        {tech.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </Reveal>
            </section>
          )}

          {/* Screenshots */}
          {gallery.length > 0 && (
            <section>
              <Reveal>
                <div className="max-w-3xl">
                  <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-primary">
                    <span className="h-px w-8 bg-primary/60" aria-hidden />
                    07 · Screenshots
                  </p>
                  <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                    In action
                  </h2>
                </div>
              </Reveal>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setLightbox(i)}
                    className="group relative overflow-hidden rounded-xl border border-border/60 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`Open screenshot ${i + 1}`}
                  >
                    <OptimizedImage
                      src={img.url}
                      alt={img.caption ?? `${project.title} screenshot ${i + 1}`}
                      width={900}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="aspect-video"
                      imgClassName="transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    {img.caption && (
                      <span className="absolute bottom-2 left-3 right-3 truncate text-xs text-white/80">{img.caption}</span>
                    )}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Video demo */}
          {primaryVideo && (
            <section>
              <Reveal>
                <div className="max-w-3xl">
                  <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-primary">
                    <span className="h-px w-8 bg-primary/60" aria-hidden />
                    08 · Video Demo
                  </p>
                  <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                    Watch it move
                  </h2>
                </div>
              </Reveal>
              <Reveal delay={0.08}>
                <div className="mt-8 overflow-hidden rounded-xl border border-border/70">
                  <video
                    controls
                    preload="none"
                    poster={getMediaUrl(project.thumbnail)}
                    className="aspect-video w-full bg-black"
                  >
                    <source src={getVideoUrl(primaryVideo)} />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </Reveal>
              {project.videos.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-3 text-sm">
                  {project.videos.map((v) => (
                    <li key={v.id}>
                      <a
                        href={getVideoUrl(v.url)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
                      >
                        <Play className="h-3.5 w-3.5" /> {v.title ?? 'Watch'}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {project.challenges && (
            <CaseSection index="09" eyebrow="Challenges" title="Challenges along the way">
              <ProseList items={project.challenges} />
            </CaseSection>
          )}

          {project.results && (
            <CaseSection index="10" eyebrow="Results" title="Outcome">
              <ProseList items={project.results} />
            </CaseSection>
          )}

          {!hasBody && project.technologies.length === 0 && gallery.length === 0 && !primaryVideo && (
            <section className="container">
              <EmptyState
                title="Case study under construction"
                description="This project is still being documented. Check back soon."
              />
            </section>
          )}
        </div>

        {/* Related */}
        {relatedProjects.length > 0 && (
          <section className="border-t border-border/60 py-20">
            <div className="container">
              <Reveal>
                <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                  Related projects
                </h2>
              </Reveal>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {relatedProjects.map((p, i) => (
                  <ProjectCard key={p.id} project={p} index={i} />
                ))}
              </div>
            </div>
          </section>
        )}
      </article>

      <MediaLightbox items={gallery} index={lightbox} onClose={() => setLightbox(null)} />
    </>
  )
}