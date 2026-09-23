import { useMemo, useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, FolderKanban } from 'lucide-react'
import Seo from '@/components/seo/Seo'
import { useProjects } from '@/hooks/use-projects'
import { useCategories } from '@/hooks/use-taxonomy'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { SectionHeading } from '@/components/section/SectionHeading'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Reveal } from '@/components/motion/Reveal'
import { cn } from '@/lib/utils'
import { EmptyState, SetupState } from '@/components/shared/StateCards'

export default function Projects() {
  const [params, setParams] = useSearchParams()
  const activeCategory = params.get('category')
  const [query, setQuery] = useState(() => params.get('q') ?? '')
  const searchRef = useRef<HTMLInputElement>(null)

  const { data, isLoading, error } = useProjects({ published: true, orderBy: 'newest' })
  const categoriesQuery = useCategories()
  const categories = categoriesQuery.data?.data ?? []

  useEffect(() => {
    if (activeCategory && !categories.some((c) => c.slug === activeCategory)) {
      setParams({}, { replace: true })
    }
  }, [activeCategory, categories, setParams])

  useEffect(() => {
    if (!params.has('q')) return
    const q = params.get('q') ?? ''
    if (q !== query) {
      setQuery(q)
    } else {
      searchRef.current?.focus()
    }
  }, [params, query])

  const projects = data?.data ?? []

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return projects.filter((p) => {
      const matchesCategory = !activeCategory || p.category?.slug === activeCategory
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.short_description ?? '').toLowerCase().includes(q)
      return matchesCategory && matchesQuery
    })
  }, [projects, activeCategory, query])

  return (
    <>
      <Seo
        title="Projects & Case Studies"
        description="A curated collection of web, FiveM, game and UI/UX projects — each documented from problem to result."
        path="/projects"
      />

      <section className="container pb-24 pt-28 md:pt-36">
        <SectionHeading
          eyebrow="Portfolio"
          title={
            <>
              Work that ships <span className="text-gradient">with intent</span>
            </>
          }
          description="Every project below is documented as a case study — the problem, the decisions, the result."
        />

        {/* Filters */}
        <Reveal delay={0.1} className="mt-12">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setParams({}, { replace: true })}
                className={cn(
                  'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                  !activeCategory
                    ? 'border-primary/60 bg-primary/15 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
                )}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setParams({ category: category.slug }, { replace: true })}
                  className={cn(
                    'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                    activeCategory === category.slug
                      ? 'border-primary/60 bg-primary/15 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
                  )}
                >
                  {category.name}
                </button>
              ))}
            </div>

            <div className="w-full max-w-xs">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => {
                    const value = e.target.value
                    setQuery(value)
                    setParams({ q: value }, { replace: true })
                  }}
                  placeholder="Search projects…"
                  className="pl-9"
                  aria-label="Search projects"
                />
              </div>
            </div>
          </div>
        </Reveal>

        {/* Grid */}
        <div className="mt-12">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-96 rounded-xl" />
              ))}
            </div>
          ) : error ? (
            <SetupState message={error?.message ?? 'Something went wrong.'} />
          ) : filtered.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((project, i) => (
                <ProjectCard key={project.id} project={project} index={i} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<FolderKanban className="h-8 w-8" />}
              title={query ? 'No matching projects' : 'No published projects yet'}
              description={
                query
                  ? 'Try a different search or category.'
                  : 'Projects are published from the admin CMS when they are ready to share.'
              }
            />
          )}
        </div>
      </section>
    </>
  )
}