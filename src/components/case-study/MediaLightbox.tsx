import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { OptimizedImage } from '@/components/media/OptimizedImage'

export function MediaLightbox({ items, index, onClose }: {
  items: { url: string; caption?: string | null; title?: string }[]
  index: number | null
  onClose: () => void
}) {
  const [current, setCurrent] = useState(index)

  useEffect(() => {
    setCurrent(index)
  }, [index])

  const close = () => {
    setCurrent(null)
    onClose()
  }

  const next = () => {
    if (current === null) return
    setCurrent((current + 1) % items.length)
  }
  const prev = () => {
    if (current === null) return
    setCurrent((current - 1 + items.length) % items.length)
  }

  useEffect(() => {
    if (current === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [current, items.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const active = current !== null ? items[current] : null

  return (
    <Dialog open={current !== null} onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-w-5xl border-border/70 bg-background/95 p-3 sm:p-4" onEscapeKeyDown={close}>
        <DialogTitle className="sr-only">Media preview</DialogTitle>
        {active && (
          <div className="flex flex-col gap-3">
            <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted/40">
              <OptimizedImage src={active.url} alt={active.caption ?? active.title ?? ''} width={1600} />
            </div>
            <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
              <span className="line-clamp-1">{active.caption ?? active.title ?? ''}</span>
              <div className="flex items-center gap-3">
                <button type="button" onClick={prev} className="uppercase tracking-wider hover:text-primary">
                  Prev
                </button>
                <span className="font-mono">
                  {(current ?? 0) + 1} / {items.length}
                </span>
                <button type="button" onClick={next} className="uppercase tracking-wider hover:text-primary">
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}