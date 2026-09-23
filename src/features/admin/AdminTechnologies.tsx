import { useState } from 'react'
import { Cpu, Plus, Pencil, Trash2, Search } from 'lucide-react'
import { toast } from 'sonner'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { useTechnologies, useSaveTechnology, useDeleteTechnology } from '@/hooks/use-taxonomy'
import type { TechnologyRow } from '@/types'
import { slugify, slugFreeEdit } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { EmptyState } from '@/components/shared/StateCards'

export default function AdminTechnologies() {
  const { data, isLoading } = useTechnologies()
  const saveTechnology = useSaveTechnology()
  const deleteTechnology = useDeleteTechnology()
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<{ id?: string; name: string; slug: string } | null>(null)
  const [slugTouched, setSlugTouched] = useState(false)
  const [deleting, setDeleting] = useState<TechnologyRow | null>(null)

  const q = query.trim().toLowerCase()
  const technologies = (data?.data ?? []).filter((t) => q === '' || t.name.toLowerCase().includes(q))

  function openNew() {
    setEditing({ name: '', slug: '' })
    setSlugTouched(false)
  }

  function openEdit(tech: TechnologyRow) {
    setEditing({ id: tech.id, name: tech.name, slug: tech.slug })
    setSlugTouched(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return
    if (!editing.name.trim()) return toast.error('Name is required.')
    if (!editing.slug.trim()) return toast.error('Slug is required.')
    try {
      const res = await saveTechnology.mutateAsync({
        id: editing.id,
        name: editing.name.trim(),
        slug: slugFreeEdit(editing.slug),
      })
      if (res.error) throw new Error(res.error)
      toast.success(editing.id ? 'Technology updated.' : 'Technology created.')
      setEditing(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save the technology.')
    }
  }

  async function handleDelete() {
    if (!deleting) return
    try {
      const res = await deleteTechnology.mutateAsync(deleting.id)
      if (res.error) throw new Error(res.error)
      toast.success(`Deleted "${deleting.name}"`)
      setDeleting(null)
    } catch {
      toast.error('Could not delete the technology.')
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Technologies"
        description="The stack tags you can attach to case studies."
        action={
          <Button onClick={openNew}>
            <Plus className="mr-1.5 h-4 w-4" /> Add technology
          </Button>
        }
      />

      <div className="mb-5 max-w-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search technologies…"
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : technologies.length === 0 ? (
        <EmptyState
          icon={<Cpu className="h-8 w-8" />}
          title={query ? 'No matching technologies' : 'No technologies yet'}
          description={
            query ? 'Try a different search.' : 'Hit "Add technology" to create your first one.'
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/70">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/70 bg-secondary/30 text-left font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  <th className="px-5 py-3.5">Name</th>
                  <th className="px-4 py-3.5">Slug</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {technologies.map((t) => (
                  <tr key={t.id} className="transition-colors hover:bg-secondary/20">
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-3 text-sm font-medium text-foreground">
                        <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-secondary/40 text-primary">
                          <Cpu className="h-4 w-4" />
                        </span>
                        {t.name}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-mono text-sm text-muted-foreground">
                      /{t.slug}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" onClick={() => openEdit(t)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" title="Delete" onClick={() => setDeleting(t)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-border/60 md:hidden">
            {technologies.map((t) => (
              <li key={t.id} className="flex items-center gap-3 p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-secondary/40 text-primary">
                  <Cpu className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{t.name}</p>
                  <p className="truncate font-mono text-[11px] text-muted-foreground">/{t.slug}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(t)} aria-label="Edit">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleting(t)} aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!isLoading && (
        <p className="mt-4 font-mono text-[11px] text-muted-foreground">
          {technologies.length} technolog{technologies.length === 1 ? 'y' : 'ies'} · alphabetical
        </p>
      )}

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? 'Edit technology' : 'Add technology'}</DialogTitle>
            <DialogDescription>
              Technologies appear as tags on case studies and as filters on listings.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tech-name">Name</Label>
                <Input
                  id="tech-name"
                  value={editing.name}
                  autoFocus
                  onChange={(e) => {
                    setEditing((prev) =>
                      prev
                        ? {
                            ...prev,
                            name: e.target.value,
                            slug: slugTouched ? prev.slug : slugify(e.target.value),
                          }
                        : prev,
                    )
                  }}
                  placeholder="React"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tech-slug">Slug</Label>
                <Input
                  id="tech-slug"
                  value={editing.slug}
                  onChange={(e) => {
                    setSlugTouched(true)
                    setEditing((prev) => (prev ? { ...prev, slug: slugFreeEdit(e.target.value) } : prev))
                  }}
                  placeholder="react"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">Lowercase, kebab-case. Used in URLs.</p>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saveTechnology.isPending}>
                  {saveTechnology.isPending ? 'Saving…' : 'Save technology'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{deleting?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              The technology is removed from the site and removed from any linked project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}