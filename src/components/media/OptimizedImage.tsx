import { useState, type CSSProperties } from 'react'
import { getMediaUrl } from '@/lib/media'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string | null | undefined
  alt: string
  className?: string
  imgClassName?: string
  /** Max rendered intrinsic width (drives responsive image sizing) */
  width?: number
  sizes?: string
  eager?: boolean
  aspect?: CSSProperties['aspectRatio']
  fallback?: string
  onClick?: () => void
}

export function OptimizedImage({
  src,
  alt,
  className,
  imgClassName,
  width = 1200,
  sizes = '100vw',
  eager = false,
  aspect,
  fallback = '/og-cover.svg',
  onClick,
}: OptimizedImageProps) {
  const [failed, setFailed] = useState(false)

  const source = failed ? fallback : src || fallback
  const url = getMediaUrl(source, { width })
  const isSvg = source.endsWith('.svg')

  return (
    <div
      className={cn('relative overflow-hidden bg-muted/40', className)}
      style={aspect ? { aspectRatio: aspect } : undefined}
      onClick={onClick}
    >
      {!eager && <div className="absolute inset-0 animate-pulse bg-muted/50" aria-hidden />}
      <img
        src={url}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        sizes={sizes}
        width={isSvg ? undefined : width}
        onLoad={(e) => {
          e.currentTarget.previousElementSibling?.remove()
        }}
        onError={() => setFailed(true)}
        className={cn('h-full w-full object-cover transition-[filter,transform]', imgClassName)}
      />
    </div>
  )
}