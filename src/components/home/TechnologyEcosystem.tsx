import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useTechnologies } from '@/hooks/use-taxonomy'
import { useProjects } from '@/hooks/use-projects'
import { technologies as fallbackTech } from '@/config/site'
import { SectionHeading } from '@/components/section/SectionHeading'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function TechnologyEcosystem() {
  const [selected, setSelected] = useState<string | null>(null)

  const techQuery = useTechnologies()
  const techList = techQuery.data?.data?.length
    ? techQuery.data.data
    : fallbackTech.map((t, i) => ({ id: `cfg-${i}`, name: t.name, slug: t.slug, created_at: '' }))

  const safeSlug = selected ?? ''
  const projectsQuery = useProjects(
    selected ? { technologySlug: safeSlug, published: true } : { published: true },
  )
  const filteredProjects = projectsQuery.data?.data ?? []

  return (
    <section className="relative py-24 md:py-32">
      <div className="container">
        <SectionHeading
          eyebrow="Technology Ecosystem"
          title={
            <>
              The stack behind <span className="text-gradient">every build</span>
            </>
          }
          description="Select a technology to see the projects it powers. This ecosystem evolves with every real product shipped."
        />

        <div className="mt-12">
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => setSelected(null)}
              className={cn(
                'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                !selected
                  ? 'border-primary/60 bg-primary/15 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
              )}
            >
              All technologies
            </button>
            {techList.map((tech) => (
              <button
                key={tech.id}
                type="button"
                onClick={() => setSelected(selected === tech.slug ? null : tech.slug)}
                aria-pressed={selected === tech.slug}
                className={cn(
                  'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                  selected === tech.slug
                    ? 'border-primary/60 bg-primary/15 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
                )}
              >
                {tech.name}
              </button>
            ))}
          </div>

          <div className="mt-10">
            {projectsQuery.isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-80 rounded-xl" />
                ))}
              </div>
            ) : filteredProjects.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.slice(0, 6).map((project, i) => (
                  <ProjectCard key={project.id} project={project} index={i} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/70 p-14 text-center">
                <p className="font-display text-lg text-foreground">
                  {selected ? `No published projects tagged with “${selected}” yet.` : 'No published projects yet.'}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {' '}
                  Real projects are added from the admin CMS.
                </p>
              </div>
            )}
          </div>

          <div className="mt-12 text-right">
            <Link
              to="/projects"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-primary"
            >
              Browse all projects
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}