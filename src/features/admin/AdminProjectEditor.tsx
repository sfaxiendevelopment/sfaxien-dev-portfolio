import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Loader2, ImagePlus, Film, Check, ChevronDown, X, GripVertical, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { MediaPickerDialog } from '@/components/admin/MediaPickerDialog'
import { useCategories } from '@/hooks/use-taxonomy'
import { useTechnologies } from '@/hooks/use-taxonomy'
import { useAdminProject, useSaveProject } from '@/hooks/use-projects'
import type { ProjectEditorPayload, ProjectImageDraft, ProjectVideoDraft } from '@/services/projects'
import { getMediaUrl, liveScreenshotUrl } from '@/lib/media'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { OptimizedImage } from '@/components/media/OptimizedImage'
import { slugFreeEdit } from '@/lib/utils'
import { PROJECT_STATUS_OPTIONS } from '@/types'

const SECTIONS: Array<{
  key: keyof ProjectEditorPayload
  label: string
  hint: string
  rows: number
}> = [
  { key: 'problem', label: 'Problem', hint: 'One statement per line.', rows: 5 },
  { key: 'solution', label: 'Solution', hint: 'One statement per line.', rows: 5 },
  { key: 'architecture', label: 'Architecture', hint: 'One statement per line.', rows: 4 },
  { key: 'features', label: 'Features', hint: 'One feature per line.', rows: 5 },
  { key: 'challenges', label: 'Challenges', hint: 'One challenge per line.', rows: 4 },
  { key: 'results', label: 'Results', hint: 'One metric / result per line.', rows: 4 },
]

const EMPTY: ProjectEditorPayload = {
  title: '',
  slug: '',
  short_description: '',
  description: '',
  category_id: null,
  client: null,
  year: new Date().getFullYear(),
  status: 'concept',
  hero_image: null,
  thumbnail: null,
  github_url: null,
  live_url: null,
  video_url: null,
  problem: '',
  solution: '',
  architecture: '',
  features: '',
  challenges: '',
  results: '',
  featured: false,
  published: true,
  is_demo: false,
  sort_order: 0,
  technology_ids: [],
  images: [],
  videos: [],
}

function asList(value: unknown): string {
  if (!value) return ''
  if (Array.isArray(value)) return value.join('\n')
  return String(value)
}

function normalizePayload(base: ProjectEditorPayload): ProjectEditorPayload {
  return {
    ...base,
    slug: base.slug || base.title,
    title: base.title.trim(),
    short_description: base.short_description.trim(),
    description: base.description.trim(),
    year: base.year ?? new Date().getFullYear(),
    status: base.status || 'concept',
    technology_ids: Array.from(new Set(base.technology_ids.filter(Boolean))),
  }
}

export default function AdminProjectEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = !id

  const snapshot = useAdminProject(id)
  const { data: categories } = useCategories()
  const { data: technologies } = useTechnologies()
  const saveMutation = useSaveProject()

  const [payload, setPayload] = useState<ProjectEditorPayload>(EMPTY)
  const [slugTouched, setSlugTouched] = useState(false)
  const [mediaFor, setMediaFor] = useState<'hero' | 'thumbnail' | 'gallery' | null>(null)

  useEffect(() => {
    if (!snapshot.data?.data) return
    const p = snapshot.data.data
    setPayload({
      title: p.title,
      slug: p.slug,
      short_description: p.short_description,
      description: p.description,
      category_id: p.category_id,
      client: p.client,
      year: p.year,
      status: (p.status as ProjectEditorPayload['status']) || 'concept',
      hero_image: p.hero_image,
      thumbnail: p.thumbnail,
      github_url: p.github_url,
      live_url: p.live_url,
      video_url: p.video_url,
      problem: asList(p.problem),
      solution: asList(p.solution),
      architecture: asList(p.architecture),
      features: asList(p.features),
      challenges: asList(p.challenges),
      results: asList(p.results),
      featured: p.featured,
      published: p.published,
      is_demo: p.is_demo,
      sort_order: p.sort_order,
      technology_ids: p.technologies.map((t) => t.id),
      images: (p.images ?? []).map((img) => ({ url: img.url, caption: img.caption, sort_order: img.sort_order })),
      videos: (p.videos ?? []).map((v) => ({ title: v.title, url: v.url, sort_order: v.sort_order })),
    })
  }, [snapshot.data])

  const set = <K extends keyof ProjectEditorPayload>(key: K, value: ProjectEditorPayload[K]) =>
    setPayload((prev) => ({ ...prev, [key]: value }))

  function onTitle(title: string) {
    setPayload((prev) => ({
      ...prev,
      title,
      slug: slugTouched ? prev.slug : slugFreeEdit(title) || prev.slug,
    }))
  }

  function toggleTechnology(id: string) {
    setPayload((prev) => ({
      ...prev,
      technology_ids: prev.technology_ids.includes(id)
        ? prev.technology_ids.filter((x) => x !== id)
        : [...prev.technology_ids, id],
    }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const next = normalizePayload(payload)
    if (!next.title) return toast.error('Title is required.')
    if (!next.slug) return toast.error('Slug is required.')
    saveMutation.mutate(
      { payload: next, id },
      {
        onSuccess: (res) => {
          if (res.error || !res.data) return toast.error(res.error ?? 'Could not save the project.')
          toast.success('Project saved.')
          navigate('/admin-sec/projects')
        },
        onError: () => toast.error('Could not save the project.'),
      },
    )
  }

  function addGalleryItem(url: string) {
    set('images', [...payload.images, { url, caption: null, sort_order: payload.images.length }])
  }
  function moveImage(index: number, delta: -1 | 1) {
    const target = index + delta
    if (target < 0 || target >= payload.images.length) return
    const next = [...payload.images]
    const [item] = next.splice(index, 1)
    next.splice(target, 0, item)
    set('images', next.map((img, i) => ({ ...img, sort_order: i })))
  }
  function removeImage(index: number) {
    set('images', payload.images.filter((_, i) => i !== index))
  }
  function patchImage(index: number, patch: Partial<ProjectImageDraft>) {
    set('images', payload.images.map((img, i) => (i === index ? { ...img, ...patch } : img)))
  }
  function addVideo() {
    set('videos', [...payload.videos, { title: null, url: '', sort_order: payload.videos.length }])
  }
  function patchVideo(index: number, patch: Partial<ProjectVideoDraft>) {
    set('videos', payload.videos.map((v, i) => (i === index ? { ...v, ...patch } : v)))
  }
  function removeVideo(index: number) {
    set('videos', payload.videos.filter((_, i) => i !== index))
  }

  const catOptions = categories?.data ?? []

  return (
    <div>
      <form onSubmit={onSubmit} className="space-y-8">
        <AdminPageHeader
          title={isNew ? 'New project' : 'Edit project'}
          description={isNew ? 'Add a case study to the site.' : 'Publish updates to this case study.'}
          action={
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                Save project
              </Button>
            </div>
          }
        />

        {/* Basics */}
        <Card>
          <CardContent className="grid gap-5 p-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="pj-title">Title</Label>
              <Input id="pj-title" value={payload.title} onChange={(e) => onTitle(e.target.value)} placeholder="Apex FiveM Framework" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="pj-slug">Slug</Label>
              <Input
                id="pj-slug"
                value={payload.slug}
                onChange={(e) => {
                  setSlugTouched(true)
                  set('slug', slugFreeEdit(e.target.value))
                }}
                placeholder="some-project"
                className="mt-2 font-mono text-sm"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">Lowercase, kebab-case. Used in the URL.</p>
            </div>
            <div>
              <Label htmlFor="pj-year">Year</Label>
              <Input
                id="pj-year"
                type="number"
                min={2000}
                max={2100}
                value={payload.year ?? ''}
                onChange={(e) => set('year', Number(e.target.value) || null)}
                className="mt-2"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="pj-short">Short description</Label>
              <Textarea
                id="pj-short"
                value={payload.short_description}
                onChange={(e) => set('short_description', e.target.value)}
                rows={2}
                maxLength={180}
                placeholder="One crisp sentence for cards and listings."
                className="mt-2 resize-none"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="pj-desc">Full description</Label>
              <Textarea
                id="pj-desc"
                value={payload.description}
                onChange={(e) => set('description', e.target.value)}
                rows={6}
                placeholder={`
The detailed write-up shown in the case study. Include the story, the build, and the value it delivered.

Can be plain text — paragraphs separated by blank lines.
`.trim()}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Classification */}
        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <Label htmlFor="pj-cat">Category</Label>
                <Select value={payload.category_id ?? ''} onValueChange={(v) => set('category_id', v || null)}>
                  <SelectTrigger id="pj-cat" className="mt-2">
                    <SelectValue placeholder="Uncategorized" />
                  </SelectTrigger>
                  <SelectContent>
                    {catOptions.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="pj-status">Status</Label>
                <Select value={payload.status ?? ''} onValueChange={(v) => set('status', v as ProjectEditorPayload['status'])}>
                  <SelectTrigger id="pj-status" className="mt-2">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="pj-client">Client</Label>
                <Input id="pj-client" value={payload.client ?? ''} onChange={(e) => set('client', e.target.value || null)} className="mt-2" />
              </div>
              <div>
                <Label htmlFor="pj-year2">Sort order</Label>
                <Input
                  id="pj-year2"
                  type="number"
                  min={0}
                  value={payload.sort_order}
                  onChange={(e) => set('sort_order', Number(e.target.value) || 0)}
                  className="mt-2"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">Lower numbers appear first.</p>
              </div>
            </div>

            <Separator />

            {/* Flags */}
            <div className="grid gap-5 md:grid-cols-2">
              <div className="flex items-start justify-between gap-4 rounded-xl border border-border/70 p-4">
                <div>
                  <Label htmlFor="pj-featured">Featured</Label>
                  <p className="mt-0.5 text-xs text-muted-foreground">Shown on the home page.</p>
                </div>
                <Checkbox id="pj-featured" checked={payload.featured} onCheckedChange={(v) => set('featured', Boolean(v))} />
              </div>
              <div className="flex items-start justify-between gap-4 rounded-xl border border-border/70 p-4">
                <div>
                  <Label htmlFor="pj-published">Published</Label>
                  <p className="mt-0.5 text-xs text-muted-foreground">Visible to visitors.</p>
                </div>
                <Checkbox id="pj-published" checked={payload.published} onCheckedChange={(v) => set('published', Boolean(v))} />
              </div>
              <div className="flex items-start justify-between gap-4 rounded-xl border border-border/70 p-4">
                <div>
                  <Label htmlFor="pj-demo">Demo project</Label>
                  <p className="mt-0.5 text-xs text-muted-foreground">Shows a “Demo Project” badge.</p>
                </div>
                <Checkbox id="pj-demo" checked={payload.is_demo} onCheckedChange={(v) => set('is_demo', Boolean(v))} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Body */}
        <Card>
          <CardContent className="space-y-6 p-6">
            <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">Case study</h3>
            {SECTIONS.map((s) => (
              <div key={s.key}>
                <div className="flex items-baseline justify-between">
                  <Label htmlFor={`pj-${s.key}`}>{s.label}</Label>
                  <span className="text-xs text-muted-foreground">{s.hint}</span>
                </div>
                <Textarea
                  id={`pj-${s.key}`}
                  value={String(payload[s.key] ?? '')}
                  onChange={(e) => set(s.key, e.target.value)}
                  rows={s.rows}
                  className="mt-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Links and showcase */}
        <Card>
          <CardContent className="grid gap-5 p-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="pj-live">Live demo / showcase URL</Label>
              <Input
                id="pj-live"
                value={payload.live_url ?? ''}
                onChange={(e) => set('live_url', e.target.value || null)}
                className="mt-2 font-mono text-sm"
                placeholder="https://my-app.com"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Where visitors can try it — a hosted web app, live demo, or a store / showcase page. A “Live Demo” button
                appears on the case study and the card. Type a bare domain (mysite.com) and it is prefixed for you. If the
                Hero / Thumbnail are left empty, they are captured from the live demo automatically.
              </p>
            </div>
            <div>
              <Label htmlFor="pj-github">GitHub URL</Label>
              <Input id="pj-github" value={payload.github_url ?? ''} onChange={(e) => set('github_url', e.target.value || null)} className="mt-2 font-mono text-sm" placeholder="https://github.com/…" />
            </div>
            <div>
              <Label htmlFor="pj-video">Video URL (web)</Label>
              <Input id="pj-video" value={payload.video_url ?? ''} onChange={(e) => set('video_url', e.target.value || null)} className="mt-2 font-mono text-sm" />
              <p className="mt-1.5 text-xs text-muted-foreground">Any public mp4 / webm URL, or a path from Media.</p>
            </div>
          </CardContent>
        </Card>

        {/* Hero + thumbnail */}
        <Card>
          <CardContent className="grid gap-5 p-6 md:grid-cols-2">
            <div>
              <Label>Hero image</Label>
              <div className="mt-2 overflow-hidden rounded-lg border border-border/70">
                {payload.hero_image ? (
                  <div className="relative">
                    <OptimizedImage
                      src={getMediaUrl(payload.hero_image)}
                      alt=""
                      width={1200}
                      className="aspect-video"
                      imgClassName="h-full w-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 h-7 w-7 bg-background/80 backdrop-blur"
                      onClick={() => set('hero_image', null)}
                      title="Remove"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/80 bg-secondary/30 text-sm text-muted-foreground">
                    <button
                      type="button"
                      onClick={() => setMediaFor('hero')}
                      className="inline-flex flex-col items-center gap-2 transition-colors hover:text-primary"
                    >
                      <ImagePlus className="h-5 w-5" />
                      Choose hero image
                    </button>
                    {payload.live_url?.trim() ? (
                      <button
                        type="button"
                        onClick={() => set('hero_image', liveScreenshotUrl(payload.live_url))}
                        className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20"
                      >
                        <Sparkles className="h-3.5 w-3.5" /> Capture from live demo
                      </button>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
            <div>
              <Label>Thumbnail</Label>
              <div className="mt-2 overflow-hidden rounded-lg border border-border/70">
                {payload.thumbnail ? (
                  <div className="relative">
                    <OptimizedImage
                      src={getMediaUrl(payload.thumbnail)}
                      alt=""
                      width={600}
                      className="aspect-video"
                      imgClassName="h-full w-full object-cover"
                    />
                    <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-2 h-7 w-7 bg-background/80 backdrop-blur" onClick={() => set('thumbnail', null)} title="Remove">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/80 bg-secondary/30 text-sm text-muted-foreground">
                    <button
                      type="button"
                      onClick={() => setMediaFor('thumbnail')}
                      className="inline-flex flex-col items-center gap-2 transition-colors hover:text-primary"
                    >
                      <ImagePlus className="h-5 w-5" />
                      Choose thumbnail
                    </button>
                    {payload.live_url?.trim() ? (
                      <button
                        type="button"
                        onClick={() => set('thumbnail', liveScreenshotUrl(payload.live_url))}
                        className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20"
                      >
                        <Sparkles className="h-3.5 w-3.5" /> Capture from live demo
                      </button>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technologies */}
        <Card>
          <CardContent className="p-6">
            <Label>Technologies</Label>
            <p className="mt-1 text-xs text-muted-foreground">Select everything that went into the build.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(technologies?.data ?? []).map((t) => {
                const active = payload.technology_ids.includes(t.id)
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTechnology(t.id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors',
                      active ? 'border-primary/70 bg-primary/15 text-primary' : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
                    )}
                  >
                    {active && <Check className="h-3.5 w-3.5" />}
                    {t.name}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Gallery */}
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Screenshots</Label>
                <p className="mt-1 text-xs text-muted-foreground">Added from your media library.</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => setMediaFor('gallery')}>
                <ImagePlus className="mr-1.5 h-4 w-4" /> Add from media
              </Button>
            </div>
            {payload.images.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
                No screenshots yet — add one from your media library.
              </p>
            ) : (
              <ul className="space-y-2">
                {payload.images.map((img, i) => (
                  <li key={i} className="flex items-start gap-3 rounded-lg border border-border/70 p-3">
                    <GripVertical className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                    <OptimizedImage src={getMediaUrl(img.url)} alt="" width={400} className="h-16 w-24 shrink-0" imgClassName="h-full w-full object-cover" />
                    <div className="min-w-0 flex-1">
                      <Input value={img.caption ?? ''} onChange={(e) => patchImage(i, { caption: e.target.value || null })} placeholder="Caption (optional)" className="h-8 text-sm" />
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <div className="flex gap-1">
                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" disabled={i === 0} onClick={() => moveImage(i, -1)} title="Move earlier">
                          <ChevronDown className="h-4 w-4 rotate-180" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" disabled={i === payload.images.length - 1} onClick={() => moveImage(i, 1)} title="Move later">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeImage(i)} title="Remove">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Videos */}
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Videos</Label>
                <p className="mt-1 text-xs text-muted-foreground">Demo / trailer clips shown in the case study.</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addVideo}>
                <Film className="mr-1.5 h-4 w-4" /> Add video
              </Button>
            </div>
            {payload.videos.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
                No videos yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {payload.videos.map((v, i) => (
                  <li key={i} className="flex items-start gap-3 rounded-lg border border-border/70 p-3">
                    <Film className="mt-2.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="grid min-w-0 flex-1 gap-2 md:grid-cols-[1fr_2fr]">
                      <Input value={v.title ?? ''} onChange={(e) => patchVideo(i, { title: e.target.value || null })} placeholder="Title (optional)" className="h-8 text-sm" />
                      <Input value={v.url} onChange={(e) => patchVideo(i, { url: e.target.value })} placeholder="https://… or media/…/clip.mp4" className="h-8 font-mono text-xs" />
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeVideo(i)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3 pb-10">
          <Button type="button" variant="ghost" asChild>
            <Link to="/admin-sec/projects">Cancel</Link>
          </Button>
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Save project
          </Button>
        </div>
      </form>

      <MediaPickerDialog
        folder="media/projects"
        open={Boolean(mediaFor)}
        onOpenChange={(open) => setMediaFor(open ? mediaFor : null)}
        onPick={(path) => {
          if (mediaFor === 'hero') set('hero_image', path)
          else if (mediaFor === 'thumbnail') set('thumbnail', path)
          else if (mediaFor === 'gallery') addGalleryItem(path)
        }}
      />
    </div>
  )
}