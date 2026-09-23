import { cachedMediaUrl, isLocalMediaPath } from '@/lib/local-store'

export const siteUrl: string =
  (import.meta.env.VITE_PUBLIC_URL as string | undefined) ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173')

interface TransformOptions {
  width?: number
  height?: number
  quality?: number
}

/**
 * Resolve a stored media path to a browser URL.
 *
 * - `/foo.png`            → local app asset (public folder)
 * - `media/foo.png`       → media uploaded to the local (IndexedDB) library
 * - `https://...`         → returned untouched
 */
export function getMediaUrl(path: string | null | undefined, options?: TransformOptions): string {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return appendTransform(path, options)
  if (path.startsWith('/')) return appendTransform(path, options)
  const cached = cachedMediaUrl(path)
  if (cached) return appendTransform(cached, options)
  return appendTransform(path, options)
}

function appendTransform(url: string, options?: TransformOptions): string {
  if (!options) return url
  const params = new URLSearchParams()
  if (options.width) params.set('width', String(Math.round(options.width)))
  if (options.height) params.set('height', String(Math.round(options.height)))
  if (options.quality) params.set('quality', String(Math.round(options.quality)))
  const qs = params.toString()
  if (!qs) return url
  return url.includes('?') ? `${url}&${qs}` : `${url}?${qs}`
}

/** Resolve a video path (local library / external / public asset). */
export function getVideoUrl(path: string): string {
  if (/^https?:\/\//i.test(path) || path.startsWith('/')) return path
  if (isLocalMediaPath(path)) {
    const cached = cachedMediaUrl(path)
    if (cached) return cached
  }
  return path
}

/**
 * Build a screenshot URL for a live site (used to auto-generate a project's
 * hero / thumbnail from its Live Demo URL). Returns '' for non-http URLs.
 */
export function liveScreenshotUrl(url: string | null | undefined, width = 1600): string {
  const clean = (url ?? '').trim()
  if (!/^https?:\/\//i.test(clean)) return ''
  return `https://s.wordpress.com/mshots/v1/${encodeURIComponent(clean)}?w=${width}`
}