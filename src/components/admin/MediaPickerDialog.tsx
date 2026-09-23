import { useEffect, useState } from 'react'
import { UploadCloud, Loader2, FileVideo } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { OptimizedImage } from '@/components/media/OptimizedImage'
import { listMedia, uploadMedia } from '@/services/media'

interface MediaPickerDialogProps {
  folder: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onPick: (publicPathOrUrl: string) => void
}

export function MediaPickerDialog({ folder, open, onOpenChange, onPick }: MediaPickerDialogProps) {
  const [items, setItems] = useState<Array<{ path: string; url: string; isImage: boolean; isVideo: boolean }>>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!open) return
    let active = true
    setLoading(true)
    listMedia(folder)
      .then((res) => {
        if (!active) return
        if (res.error) toast.error(res.error)
        const seen = new Set<string>()
        const filtered = (res.data ?? []).filter((i) => (seen.has(i.path) ? false : (seen.add(i.path), true)))
        setItems(filtered)
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [open, folder])

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const file = files[0]
      const res = await uploadMedia(file, folder)
      if (res.error || !res.data) {
        toast.error(res.error ?? 'Upload failed.')
        return
      }
      toast.success('Uploaded to the media library.')
      onPick(res.data.path)
      onOpenChange(false)
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Choose media</DialogTitle>
          <DialogDescription>Pick an image from “{folder}” or upload a new one.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-3">
            <Label htmlFor="media-upload" className="sr-only">
              Upload file
            </Label>
            <Input
              id="media-upload"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif,video/mp4,video/webm"
              className="flex-1"
              onChange={(e) => handleUpload(e.target.files)}
              disabled={uploading}
            />
            <Button disabled={uploading}>
              {uploading ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <UploadCloud className="mr-1.5 h-4 w-4" />
              )}
              Upload
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-video rounded-lg" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border/70 py-10 text-center font-mono text-xs text-muted-foreground">
              No media in “{folder}” yet. Upload something above.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {items.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => {
                    onPick(item.path)
                    onOpenChange(false)
                  }}
                  className="group relative aspect-video overflow-hidden rounded-lg border border-border/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  title={item.path.split('/').pop() ?? item.path}
                >
                  {item.isImage ? (
                    <OptimizedImage src={item.path} alt={item.path.split('/').pop() ?? item.path} width={400} eager className="h-full w-full transition-transform duration-300 group-hover:scale-105" />
                  ) : item.isVideo ? (
                    <div className="flex h-full w-full items-center justify-center bg-secondary/60">
                      <FileVideo className="h-6 w-6 text-muted-foreground" />
                    </div>
                  ) : null}
                  <span className="absolute inset-0 bg-primary/0 transition-colors group-hover:bg-primary/10" aria-hidden />
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}