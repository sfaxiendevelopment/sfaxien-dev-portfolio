import { useEffect, useState } from 'react'
import { UploadCloud, Loader2, FileVideo, Trash2, Link2, Image, Check, FolderKanban } from 'lucide-react'
import { toast } from 'sonner'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { listMedia, uploadMedia, deleteMediaObject, type MediaItem } from '@/services/media'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { OptimizedImage } from '@/components/media/OptimizedImage'
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
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/shared/StateCards'

const PRESET_FOLDERS = ['media/projects', 'media/site', 'media/tech']

export default function AdminMedia() {
  const [folder, setFolder] = useState('media/projects')
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [copied, setCopied] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<MediaItem | null>(null)

  async function load() {
    const res = await listMedia(folder)
    if (res.error) {
      toast.error(res.error)
      setItems([])
      return
    }
    setItems(res.data ?? [])
  }

  useEffect(() => {
    let active = true
    setLoading(true)
    listMedia(folder)
      .then((res) => {
        if (!active) return
        if (res.error) toast.error(res.error)
        setItems(res.data ?? [])
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [folder])

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return
    const file = files[0]
    setUploading(true)
    setProgress(0)
    try {
      const res = await uploadMedia(file, folder, (p) => setProgress(p))
      if (res.error || !res.data) {
        toast.error(res.error ?? 'Upload failed.')
        return
      }
      toast.success('Uploaded to the media library.')
      const refreshed = await listMedia(folder)
      if (!refreshed.error) setItems(refreshed.data ?? [])
    } finally {
      setUploading(false)
    }
  }

  async function copyPath(path: string) {
    try {
      await navigator.clipboard.writeText(path)
      setCopied(path)
      setTimeout(() => setCopied((c) => (c === path ? null : c)), 1500)
    } catch {
      toast.error('Could not copy the path.')
    }
  }

  async function handleDelete() {
    if (!deleting) return
    try {
      const res = await deleteMediaObject(deleting.path)
      if (res.error) throw new Error(res.error)
      toast.success('Media deleted.')
      setDeleting(null)
      await load()
    } catch {
      toast.error('Could not delete the media.')
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Media"
        description="Upload images and videos to the public media library."
        action={
          <div className="flex items-center gap-3">
            <div className="w-56">
              <div className="relative">
                <FolderKanban className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={folder}
                  onChange={(e) => setFolder(e.target.value.trim())}
                  placeholder="media/projects"
                  className="pl-9 font-mono text-xs"
                  aria-label="Storage folder"
                />
              </div>
            </div>
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {PRESET_FOLDERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFolder(f)}
            className={cn(
              'rounded-full border px-3 py-1.5 font-mono text-xs transition-colors',
              folder === f
                ? 'border-primary/60 bg-primary/15 text-primary'
                : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mb-8 rounded-xl border border-border/70 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <Label htmlFor="media-upload" className="sr-only">
              Upload file
            </Label>
            <Input
              id="media-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif,video/mp4,video/webm"
              onChange={(e) => handleUpload(e.target.files)}
              disabled={uploading}
            />
          </div>
          <div className="flex items-center gap-3">
            {uploading && (
              <div className="flex items-center gap-2.5">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <div className="h-2 w-40 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="font-mono text-xs text-muted-foreground">{progress}%</span>
              </div>
            )}
            <Button type="button" disabled={uploading} onClick={() => document.getElementById('media-upload')?.click()}>
              {uploading ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <UploadCloud className="mr-1.5 h-4 w-4" />
              )}
              Upload {uploading ? '…' : ''}
            </Button>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          JPG, PNG, WEBP, SVG, GIF, MP4 and WebM. Up to 100 MB per file.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-video rounded-lg" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Image className="h-8 w-8" />}
          title="No media in this folder"
          description="Upload a file above, or switch to another folder."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.path} className="group relative overflow-hidden rounded-xl border border-border/70">
              <div className="aspect-video overflow-hidden bg-secondary/30">
                {item.isImage ? (
                  <OptimizedImage src={item.url} alt={item.path.split('/').pop() ?? item.path} width={600} eager className="h-full w-full" />
                ) : item.isVideo ? (
                  <div className="flex h-full w-full items-center justify-center bg-secondary/60">
                    <FileVideo className="h-8 w-8 text-muted-foreground" />
                  </div>
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-secondary/60">
                    <Image className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 border-t border-border/70 bg-card p-2">
                <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-muted-foreground">
                  {item.path.split('/').pop()}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  title="Copy path"
                  onClick={() => copyPath(item.path)}
                >
                  {copied === item.path ? <Check className="h-3.5 w-3.5 text-primary" /> : <Link2 className="h-3.5 w-3.5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 text-destructive hover:text-destructive"
                  title="Delete"
                  onClick={() => setDeleting(item)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && items.length > 0 && (
        <p className="mt-4 font-mono text-[11px] text-muted-foreground">
          {items.length} file{items.length === 1 ? '' : 's'} in “{folder}”
        </p>
      )}

      <AlertDialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this file?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleting?.path.split('/').pop() ?? deleting?.path}” is permanently removed from storage. Any project that references it will break.
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