import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Pencil,
  Copy,
  Trash2,
  Eye,
  Search,
  FolderKanban,
  ArrowUpDown,
} from 'lucide-react'
import { toast } from 'sonner'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { useAdminProjects, useSetProjectFlag, useDeleteProject, useDuplicateProject } from '@/hooks/use-projects'
import { statusLabel } from '@/components/projects/ProjectCard'
import { OptimizedImage } from '@/components/media/OptimizedImage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/shared/StateCards'

export default function AdminProjects() {
  const navigate = useNavigate()
  const { data, isLoading } = useAdminProjects()
  const setFlag = useSetProjectFlag()
  const remove = useDeleteProject()
  const duplicate = useDuplicateProject()
  const [query, setQuery] = useState('')

  const projects = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (data?.data ?? []).filter((p) => q === '' || p.title.toLowerCase().includes(q))
  }, [data, query])

  async function toggleFlag(id: string, flag: 'featured' | 'published', value: boolean) {
    try {
      const res = await setFlag.mutateAsync({ id, flag, value })
      if (res.error) throw new Error(res.error)
      toast.success(flag === 'published' ? (value ? 'Project published' : 'Project set to draft') : value ? 'Featured' : 'Unfeatured')
    } catch {
      toast.error('Could not update the project.')
    }
  }

  async function onDuplicate(id: string) {
    try {
      const res = await duplicate.mutateAsync(id)
      if (res.error || !res.data) throw new Error(res.error ?? 'Duplicate failed')
      toast.success('Project copied as a draft')
      navigate(`/admin-sec/projects/${res.data}/edit`)
    } catch {
      toast.error('Could not duplicate the project.')
    }
  }

  async function onDelete(id: string, title: string) {
    try {
      const res = await remove.mutateAsync(id)
      if (res.error) throw new Error(res.error)
      toast.success(`Deleted "${title}"`)
    } catch {
      toast.error('Could not delete the project.')
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Projects"
        description="Create, edit, publish and organize case studies."
        action={
          <Button asChild>
            <Link to="/admin-sec/projects/new">
              <span className="mr-1">+</span> New project
            </Link>
          </Button>
        }
      />

      <div className="mb-5 max-w-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects…"
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="h-8 w-8" />}
          title={query ? 'No matching projects' : 'No projects yet'}
          description={
            query ? 'Try a different search.' : 'Hit "New project" to create your first case study.'
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/70">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/70 bg-secondary/30 text-left font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  <th className="px-5 py-3.5">Project</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Year</th>
                  <th className="px-4 py-3.5">Featured</th>
                  <th className="px-4 py-3.5">Published</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {projects.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-secondary/20">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-16 shrink-0 overflow-hidden rounded-md border border-border/60">
                          <OptimizedImage
                            src={p.thumbnail || p.hero_image}
                            alt=""
                            width={160}
                            className="h-full w-full"
                            eager
                          />
                        </div>
                        <div className="min-w-0">
                          <Link
                            to={`/admin-sec/projects/${p.id}/edit`}
                            className="block truncate text-sm font-medium text-foreground hover:text-primary"
                          >
                            {p.title}
                          </Link>
                          <p className="truncate font-mono text-[11px] text-muted-foreground">
                            /projects/{p.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-muted-foreground">{p.category?.name ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={p.status === 'completed' ? 'success' : 'secondary'}>
                        {statusLabel(p.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-sm text-muted-foreground">{p.year ?? '—'}</td>
                    <td className="px-4 py-3.5">
                      <Switch
                        checked={p.featured}
                        onCheckedChange={(v) => toggleFlag(p.id, 'featured', v)}
                        aria-label={`Feature ${p.title}`}
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <Switch
                        checked={p.published}
                        onCheckedChange={(v) => toggleFlag(p.id, 'published', v)}
                        aria-label={`Publish ${p.title}`}
                        className={cn(!p.published && 'opacity-50')}
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8" title="View case study">
                          <Link to={`/projects/${p.slug}`} target="_blank">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" onClick={() => navigate(`/admin-sec/projects/${p.id}/edit`)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Duplicate" onClick={() => onDuplicate(p.id)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete “{p.title}”?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This permanently deletes the project and its images, videos and technology links. This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => onDelete(p.id, p.title)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile list */}
          <ul className="divide-y divide-border/60 md:hidden">
            {projects.map((p) => (
              <li key={p.id} className="flex items-start gap-3 p-4">
                <div className="h-12 w-20 shrink-0 overflow-hidden rounded-md border border-border/60">
                  <OptimizedImage src={p.thumbnail || p.hero_image} alt="" width={160} className="h-full w-full" eager />
                </div>
                <div className="min-w-0 flex-1">
                  <Link to={`/admin-sec/projects/${p.id}/edit`} className="text-sm font-medium text-foreground hover:text-primary">
                    {p.title}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{statusLabel(p.status)}</Badge>
                    {p.featured && <Badge variant="accent">Featured</Badge>}
                    <Badge variant={p.published ? 'success' : 'secondary'}>{p.published ? 'Published' : 'Draft'}</Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Button asChild variant="ghost" size="icon" className="h-7 w-7">
                      <Link to={`/admin-sec/projects/${p.id}/edit`} aria-label="Edit">
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDuplicate(p.id)} aria-label="Duplicate">
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" aria-label="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete “{p.title}”?</AlertDialogTitle>
                          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(p.id, p.title)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {!isLoading && (
        <p className="mt-4 flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
          <ArrowUpDown className="h-3.5 w-3.5" /> {projects.length} project{projects.length === 1 ? '' : 's'} · sorted by
          sort order
        </p>
      )}
    </div>
  )
}