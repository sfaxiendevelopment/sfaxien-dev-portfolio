import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useFeaturedProjects } from '@/hooks/use-projects'
import { SectionHeading } from '@/components/section/SectionHeading'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { Skeleton } from '@/components/ui/skeleton'

export function FeaturedProjects() {
  const { data, isLoading } = useFeaturedProjects(3)
  const projects = data?.data ?? []

  return (
    <section className="relative py-24 md:py-32">
      <div className="container">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Featured Work"
            title={
              <>
                Selected <span className="text-gradient">case studies</span>
              </>
            }
            description="A curated set of builds. Every project is documented end-to-end — from the problem to the result."
          />
          <Link
            to="/projects"
            className="group hidden items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary sm:inline-flex"
          >
            View all projects
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="mt-14">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-96 rounded-xl" />
              ))}
            </div>
          ) : projects.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project, i) => (
                <ProjectCard key={project.id} project={project} index={i} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border/70 p-14 text-center">
              <p className="font-display text-lg text-foreground">No featured projects yet.</p>
              <p className="mt-2 text-sm text-muted-foreground">Feature projects from the admin CMS to showcase them here.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}