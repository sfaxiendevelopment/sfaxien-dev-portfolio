import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, ExternalLink, Layers } from 'lucide-react'
import type { ProjectWithRelations } from '@/types'
import { OptimizedImage } from '@/components/media/OptimizedImage'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { usePrefersReducedMotion } from '@/hooks/use-media'

export function statusLabel(status: string | null): string {
  switch (status) {
    case 'completed':
      return 'Completed'
    case 'in-progress':
      return 'In Progress'
    case 'concept':
      return 'Concept'
    case 'archived':
      return 'Archived'
    default:
      return status ?? 'Case Study'
  }
}

interface ProjectCardProps {
  project: ProjectWithRelations
  index?: number
  className?: string
}

export function ProjectCard({ project, index = 0, className }: ProjectCardProps) {
  const reduced = usePrefersReducedMotion()
  const del = reduced ? 0 : (index % 6) * 0.06

  return (
    <motion.article
      initial={reduced ? false : { opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.7, delay: del, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'group relative rounded-xl border border-border/70 bg-card p-2.5 transition-colors duration-300 hover:border-primary/40',
        className,
      )}
    >
      <Link to={`/projects/${project.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-muted/40">
          <OptimizedImage
            src={project.hero_image || project.thumbnail}
            alt={project.title}
            width={900}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            aspect="16/10"
            eager={index < 2}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-40" />

          <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2">
            {project.category && (
              <Badge variant="secondary" className="backdrop-blur-md">
                {project.category.name}
              </Badge>
            )}
            {project.is_demo && <Badge variant="demo">Demo Project</Badge>}
          </div>

          {project.status && (
            <span className="absolute right-3 top-3 rounded-full border border-white/15 bg-black/40 px-2.5 py-0.5 text-[11px] font-medium text-white/90 backdrop-blur-md">
              {statusLabel(project.status)}
            </span>
          )}

          {project.live_url && (
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2.5 py-1 text-[11px] font-medium text-emerald-400 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Live
            </span>
          )}

          <span className="absolute bottom-3 right-3 flex h-9 w-9 translate-y-1 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>

        <div className="px-2.5 pb-1 pt-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
              {project.title}
            </h3>
            {project.year && <span className="shrink-0 font-mono text-xs text-muted-foreground">{project.year}</span>}
          </div>

          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {project.short_description || project.description}
          </p>

          {project.technologies.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              <Layers className="mr-1 h-3.5 w-3.5 text-muted-foreground/60" />
              {project.technologies.slice(0, 4).map((tech) => (
                <span
                  key={tech.id}
                  className="rounded border border-border bg-secondary/40 px-2 py-0.5 text-[11px] text-muted-foreground"
                >
                  {tech.name}
                </span>
              ))}
              {project.technologies.length > 4 && (
                <span className="text-[11px] text-muted-foreground">+{project.technologies.length - 4}</span>
              )}
            </div>
          )}
        </div>
      </Link>

      <div className="flex items-center justify-between gap-3 px-2.5 pb-1 pt-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
          View Case Study
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </span>
        {project.live_url && (
          <a
            href={project.live_url}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-emerald-400/50 hover:text-emerald-400"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Live Demo
          </a>
        )}
      </div>
    </motion.article>
  )
}