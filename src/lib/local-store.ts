import type { CategoryRow, TechnologyRow, ContactMessageRow } from '@/types'
import { cloudFetchContent, cloudPutTable, getCloudToken } from '@/lib/cloud'

/**
 * Local web-storage data layer.
 *
 * Structured records (projects, categories, technologies, messages, admin
 * session) live in `localStorage` as JSON. Binary media (images/videos) live
 * in an IndexedDB store, with a lightweight metadata index in `localStorage`.
 * Content is seeded on first run (mirrors the old seed data) and is
 * fully editable through the admin CMS.
 */

const TABLES = {
  projects: 'sfaxien.projects',
  categories: 'sfaxien.categories',
  technologies: 'sfaxien.technologies',
  messages: 'sfaxien.messages',
  mediaIndex: 'sfaxien.mediaIndex',
  seedVersion: 'sfaxien.seedVersion',
} as const

// ---------------------------------------------------------------------------
// JSON tables (localStorage)
// ---------------------------------------------------------------------------

export function tableRead<T>(key: string): T[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch {
    return []
  }
}

const CLOUD_TABLES: Record<string, string> = {
  [TABLES.projects]: 'projects',
  [TABLES.categories]: 'categories',
  [TABLES.technologies]: 'technologies',
}

let hydratingFromCloud = false

export function tableWrite<T>(key: string, rows: T[]): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(rows))
  const table = CLOUD_TABLES[key]
  if (!table || hydratingFromCloud || !getCloudToken()) return
  void cloudPutTable(table, rows)
}

/** Insert or update a row in a table (matched by `id`). */
export function tableUpsert<T extends { id: string }>(key: string, row: T): T {
  const rows = tableRead<T>(key)
  const index = rows.findIndex((r) => r.id === row.id)
  if (index >= 0) rows[index] = row
  else rows.push(row)
  tableWrite(key, rows)
  return row
}

export function tableDelete(key: string, id: string): void {
  tableWrite(
    key,
    tableRead(key).filter((row) => (row as { id: string }).id !== id),
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function uid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function nowIso(): string {
  return new Date().toISOString()
}

export function isLocalMediaPath(path: string | null | undefined): boolean {
  return Boolean(path) && !path!.startsWith('/') && !/^https?:\/\//i.test(path!)
}

// ---------------------------------------------------------------------------
// Media (IndexedDB blobs + localStorage index + blob URL cache)
// ---------------------------------------------------------------------------

const MEDIA_DB = 'sfaxien-media'
const MEDIA_STORE = 'files'
const MAX_MEDIA_ENTRIES = 500

export interface StoredMediaIndexEntry {
  path: string
  name: string
  size: number
  type: string
  isImage: boolean
  isVideo: boolean
  updatedAt: string
}

const indexKey = TABLES.mediaIndex

export function mediaIndex(): StoredMediaIndexEntry[] {
  return tableRead<StoredMediaIndexEntry>(indexKey)
}

function writeMediaIndex(entries: StoredMediaIndexEntry[]): void {
  tableWrite(indexKey, entries)
}
export { writeMediaIndex }

function openMediaDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available in this browser.'))
      return
    }
    const req = indexedDB.open(MEDIA_DB, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(MEDIA_STORE)) {
        db.createObjectStore(MEDIA_STORE, { keyPath: 'path' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('Could not open media storage.'))
  })
}

async function withStore<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openMediaDb()
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(MEDIA_STORE, mode)
    const req = fn(tx.objectStore(MEDIA_STORE))
    req.onsuccess = () => {
      resolve(req.result)
      try {
        db.close()
      } catch {
        // ignore
      }
    }
    req.onerror = () => {
      reject(req.error ?? new Error('Media storage operation failed.'))
      try {
        db.close()
      } catch {
        // ignore
      }
    }
  })
}

export async function mediaPut(path: string, blob: Blob): Promise<void> {
  await withStore('readwrite', (store) => store.put({ path, blob }))
}

export async function mediaGet(path: string): Promise<Blob | null> {
  const record = await withStore<{ path: string; blob: Blob } | undefined>('readonly', (store) =>
    store.get(path),
  )
  return record?.blob ?? null
}

export async function mediaDeleteBlob(path: string): Promise<void> {
  await withStore('readwrite', (store) => store.delete(path))
}

export async function mediaListBlobs(): Promise<Array<{ path: string; blob: Blob }>> {
  return await withStore<Array<{ path: string; blob: Blob }>>('readonly', (store) => store.getAll())
}

const blobUrlCache = new Map<string, string>()

export function cachedMediaUrl(path: string): string | null {
  return blobUrlCache.get(path) ?? null
}

export function cacheMediaBlob(path: string, blob: Blob): string {
  const existing = blobUrlCache.get(path)
  if (existing) return existing
  const url = URL.createObjectURL(blob)
  blobUrlCache.set(path, url)
  return url
}

/** Rebuild the in-memory path → object-URL cache from IndexedDB at boot. */
export async function hydrateMediaCache(): Promise<void> {
  if (typeof indexedDB === 'undefined') return
  try {
    const records = await mediaListBlobs()
    for (const { path, blob } of records) {
      if (!blobUrlCache.has(path)) {
        const url = URL.createObjectURL(blob)
        blobUrlCache.set(path, url)
      }
    }
  } catch {
    // Non-fatal — media will fail gracefully if the cache can't hydrate.
  }
}

// ---------------------------------------------------------------------------
// Seeding
// ---------------------------------------------------------------------------

const SEED_VERSION = '3'

function seedIfNeeded(): void {
  if (typeof window === 'undefined') return
  if (window.localStorage.getItem(TABLES.seedVersion) === SEED_VERSION) return
  window.localStorage.setItem(TABLES.seedVersion, SEED_VERSION)

  const ts = '2025-01-01T09:00:00.000Z'

  const categories: CategoryRow[] = [
    { id: '00000000-0000-4000-8000-000000000101', name: 'Web', slug: 'web', created_at: ts },
    { id: '00000000-0000-4000-8000-000000000102', name: 'FiveM', slug: 'fivem', created_at: ts },
    { id: '00000000-0000-4000-8000-000000000103', name: 'Game', slug: 'game', created_at: ts },
    { id: '00000000-0000-4000-8000-000000000104', name: 'UI/UX', slug: 'ui-ux', created_at: ts },
    { id: '00000000-0000-4000-8000-000000000105', name: 'AI', slug: 'ai', created_at: ts },
    { id: '00000000-0000-4000-8000-000000000106', name: 'Other', slug: 'other', created_at: ts },
  ]

  const technologies: TechnologyRow[] = [
    { id: '00000000-0000-4000-8000-000000000201', name: 'React', slug: 'react', created_at: ts },
    { id: '00000000-0000-4000-8000-000000000202', name: 'Vite', slug: 'vite', created_at: ts },
    { id: '00000000-0000-4000-8000-000000000203', name: 'TypeScript', slug: 'typescript', created_at: ts },
    { id: '00000000-0000-4000-8000-000000000204', name: 'JavaScript', slug: 'javascript', created_at: ts },
    { id: '00000000-0000-4000-8000-000000000205', name: 'Tailwind CSS', slug: 'tailwind-css', created_at: ts },
    { id: '00000000-0000-4000-8000-000000000206', name: 'PostgreSQL', slug: 'postgresql', created_at: ts },
    { id: '00000000-0000-4000-8000-000000000207', name: 'Node.js', slug: 'nodejs', created_at: ts },
    { id: '00000000-0000-4000-8000-000000000208', name: 'Lua', slug: 'lua', created_at: ts },
    { id: '00000000-0000-4000-8000-000000000209', name: 'FiveM', slug: 'fivem', created_at: ts },
    { id: '00000000-0000-4000-8000-000000000210', name: 'Unreal Engine', slug: 'unreal-engine', created_at: ts },
    { id: '00000000-0000-4000-8000-000000000211', name: 'Python', slug: 'python', created_at: ts },
    { id: '00000000-0000-4000-8000-000000000212', name: 'Git', slug: 'git', created_at: ts },
    { id: '00000000-0000-4000-8000-000000000213', name: 'GitHub', slug: 'github', created_at: ts },
  ]

  tableWrite<ContactMessageRow>(TABLES.projects, [])
  tableWrite(TABLES.categories, categories)
  tableWrite(TABLES.technologies, technologies)
  tableWrite<ContactMessageRow>(TABLES.messages, [])
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------

/** Seed tables (sync) and hydrate the media cache (async, best-effort). */
export function initLocalApi(): void {
  seedIfNeeded()
  void hydrateMediaCache()
}

/** Pull shared content from the Cloudflare Worker into the local cache. */
export async function hydrateFromCloud(): Promise<boolean> {
  const content = await cloudFetchContent()
  if (!content) return false
  hydratingFromCloud = true
  try {
    if (content.categories.length) tableWrite(TABLES.categories, content.categories)
    if (content.technologies.length) tableWrite(TABLES.technologies, content.technologies)
    if (content.projects.length || !tableRead(TABLES.projects).length) {
      tableWrite(TABLES.projects, content.projects)
    }
  } finally {
    hydratingFromCloud = false
  }
  return true
}

export interface PublishResult {
  ok: boolean
  counts: { projects: number; categories: number; technologies: number }
}

export interface ContentBundle {
  exported_at: string
  projects: unknown[]
  categories: unknown[]
  technologies: unknown[]
}

export function exportContent(): ContentBundle {
  return {
    exported_at: nowIso(),
    projects: tableRead(TABLES.projects),
    categories: tableRead(TABLES.categories),
    technologies: tableRead(TABLES.technologies),
  }
}

export function importContent(bundle: Partial<ContentBundle>): { projects: number } {
  const counts = { projects: 0 }
  if (Array.isArray(bundle.projects)) {
    tableWrite(TABLES.projects, bundle.projects)
    counts.projects = bundle.projects.length
  }
  if (Array.isArray(bundle.categories) && bundle.categories.length) {
    tableWrite(TABLES.categories, bundle.categories)
  }
  if (Array.isArray(bundle.technologies) && bundle.technologies.length) {
    tableWrite(TABLES.technologies, bundle.technologies)
  }
  return counts
}

/** Push the local content tables to the Cloudflare Worker (admin only). */
export async function publishContentToCloud(): Promise<PublishResult> {
  const projects = tableRead<unknown>(TABLES.projects)
  const categories = tableRead<unknown>(TABLES.categories)
  const technologies = tableRead<unknown>(TABLES.technologies)
  const counts = { projects: projects.length, categories: categories.length, technologies: technologies.length }
  if (!getCloudToken()) return { ok: false, counts }
  const results = await Promise.all([
    cloudPutTable('projects', projects),
    cloudPutTable('categories', categories),
    cloudPutTable('technologies', technologies),
  ])
  return { ok: results.every(Boolean), counts }
}

// Constants re-exported for convenience/parity with the old storage module.
export const localTables = TABLES
export const mediaIndexLimit = MAX_MEDIA_ENTRIES