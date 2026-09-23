import { useState } from 'react'
import { Tags, Plus, Pencil, Trash2, Search } from 'lucide-react'
import { toast } from 'sonner'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { useCategories, useSaveCategory, useDeleteCategory } from '@/hooks/use-taxonomy'
import type { CategoryRow } from '@/types'
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

export default function AdminCategories() {
  const { data, isLoading } = useCategories()
  const saveCategory = useSaveCategory()
  const deleteCategory = useDeleteCategory()
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<{ id?: string; name: string; slug: string } | null>(null)
  const [slugTouched, setSlugTouched] = useState(false)
  const [deleting, setDeleting] = useState<CategoryRow | null>(null)

  const q = query.trim().toLowerCase()
  const categories = (data?.data ?? []).filter((c) => q === '' || c.name.toLowerCase().includes(q))

  function openNew() {
    setEditing({ name: '', slug: '' })
    setSlugTouched(false)
  }

  function openEdit(category: CategoryRow) {
    setEditing({ id: category.id, name: category.name, slug: category.slug })
    setSlugTouched(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return
    if (!editing.name.trim()) return toast.error('Name is required.')
    if (!editing.slug.trim()) return toast.error('Slug is required.')
    try {
      const res = await saveCategory.mutateAsync({
        id: editing.id,
        name: editing.name.trim(),
        slug: slugFreeEdit(editing.slug),
      })
      if (res.error) throw new Error(res.error)
      toast.success(editing.id ? 'Category updated.' : 'Category created.')
      setEditing(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save the category.')
    }
  }

  async function handleDelete() {
    if (!deleting) return
    try {
      const res = await deleteCategory.mutateAsync(deleting.id)
      if (res.error) throw new Error(res.error)
      toast.success(`Deleted "${deleting.name}"`)
      setDeleting(null)
    } catch {
      toast.error('Could not delete the category.')
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Categories"
        description="Group projects into browsable categories."
        action={
          <Button onClick={openNew}>
            <Plus className="mr-1.5 h-4 w-4" /> Add category
          </Button>
        }
      />

      <div className="mb-5 max-w-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search categories…"
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
      ) : categories.length === 0 ? (
        <EmptyState
          icon={<Tags className="h-8 w-8" />}
          title={query ? 'No matching categories' : 'No categories yet'}
          description={
            query ? 'Try a different search.' : 'Hit "Add category" to create your first one.'
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
                {categories.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-secondary/20">
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-3 text-sm font-medium text-foreground">
                        <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-secondary/40 text-primary">
                          <Tags className="h-4 w-4" />
                        </span>
                        {c.name}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-mono text-sm text-muted-foreground">
                      /{c.slug}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" onClick={() => openEdit(c)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" title="Delete" onClick={() => setDeleting(c)}>
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
            {categories.map((c) => (
              <li key={c.id} className="flex items-center gap-3 p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-secondary/40 text-primary">
                  <Tags className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
                  <p className="truncate font-mono text-[11px] text-muted-foreground">/{c.slug}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)} aria-label="Edit">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleting(c)} aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!isLoading && (
        <p className="mt-4 font-mono text-[11px] text-muted-foreground">
          {categories.length} categor{categories.length === 1 ? 'y' : 'ies'} · alphabetical
        </p>
      )}

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? 'Edit category' : 'Add category'}</DialogTitle>
            <DialogDescription>
              Categories appear as filters on the portfolio and project listings.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cat-name">Name</Label>
                <Input
                  id="cat-name"
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
                  placeholder="Web Development"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-slug">Slug</Label>
                <Input
                  id="cat-slug"
                  value={editing.slug}
                  onChange={(e) => {
                    setSlugTouched(true)
                    setEditing((prev) => (prev ? { ...prev, slug: slugFreeEdit(e.target.value) } : prev))
                  }}
                  placeholder="web-development"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">Lowercase, kebab-case. Used in URLs.</p>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saveCategory.isPending}>
                  {saveCategory.isPending ? 'Saving…' : 'Save category'}
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
              The category is removed from the site. Projects in it become uncategorized.
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