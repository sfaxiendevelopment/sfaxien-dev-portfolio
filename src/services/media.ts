import {
  mediaPut,
  mediaDeleteBlob,
  mediaIndex,
  writeMediaIndex,
  cachedMediaUrl,
  cacheMediaBlob,
  nowIso,
  type StoredMediaIndexEntry,
} from '@/lib/local-store'
import type { ServiceResult } from './projects'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm']
const MAX_SIZE = 100 * 1024 * 1024

export function isImageFile(file: File): boolean {
  return ALLOWED_IMAGE_TYPES.includes(file.type)
}

export function isVideoFile(file: File): boolean {
  return ALLOWED_VIDEO_TYPES.includes(file.type)
}

export function isAllowedMediaType(file: File): boolean {
  return isImageFile(file) || isVideoFile(file)
}

export function mediaTypeLabel(type: string): string {
  if (ALLOWED_IMAGE_TYPES.includes(type)) return 'Image'
  if (ALLOWED_VIDEO_TYPES.includes(type)) return 'Video'
  return 'File'
}

export async function uploadMedia(
  file: File,
  folder: string,
  onProgress?: (percent: number) => void,
): Promise<ServiceResult<{ path: string; size: number; type: string }>> {
  if (!file) return { data: null, error: 'No file selected.' }
  if (!isAllowedMediaType(file)) {
    return { data: null, error: 'Unsupported file type. Use JPG, PNG, WEBP, SVG, GIF, MP4 or WebM.' }
  }
  if (file.size > MAX_SIZE) {
    return { data: null, error: 'File is too large. The limit is 100 MB.' }
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
  const safeName = `${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`
  const path = `${folder.replace(/^\/|\/$/g, '')}/${safeName}`

  onProgress?.(0)

  const entry: StoredMediaIndexEntry = {
    path,
    name: safeName,
    size: file.size,
    type: file.type,
    isImage: isImageFile(file),
    isVideo: isVideoFile(file),
    updatedAt: nowIso(),
  }

  await mediaPut(path, file)
  const index = mediaIndex().filter((item) => item.path !== path)
  index.unshift(entry)
  writeMediaIndex(index)
  cacheMediaBlob(path, file)

  onProgress?.(100)
  return { data: { path, size: file.size, type: file.type }, error: null }
}

export interface MediaItem {
  name: string
  path: string
  url: string
  size: number
  updatedAt: string
  isImage: boolean
  isVideo: boolean
}

export async function listMedia(folder: string, limit = 300): Promise<ServiceResult<MediaItem[]>> {
  const prefix = `${folder.replace(/^\/|\/$/g, '')}/`
  const index = mediaIndex()
    .filter((item) => item.path.startsWith(prefix))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, limit)

  const items: MediaItem[] = index.map((entry) => ({
    name: entry.name,
    path: entry.path,
    url: cachedMediaUrl(entry.path) ?? entry.path,
    size: entry.size,
    updatedAt: entry.updatedAt,
    isImage: entry.isImage,
    isVideo: entry.isVideo,
  }))

  return { data: items, error: null }
}

export async function deleteMediaObject(path: string): Promise<ServiceResult<null>> {
  try {
    await mediaDeleteBlob(path)
  } catch {
    // Blob may already be gone; continue with index cleanup.
  }
  writeMediaIndex(mediaIndex().filter((item) => item.path !== path))
  const cached = cachedMediaUrl(path)
  if (cached) {
    try {
      URL.revokeObjectURL(cached)
    } catch {
      // ignore
    }
  }
  return { data: null, error: null }
}