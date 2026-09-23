import {
  tableRead,
  tableWrite,
  tableUpsert,
  tableDelete,
  uid,
  nowIso,
} from '@/lib/local-store'
import { liveScreenshotUrl } from '@/lib/media'
import type {
  ProjectWithRelations,
  ProjectRow,
  ProjectImageRow,
  ProjectVideoRow,
  CategoryRow,
  TechnologyRow,
} from '@/types'

export interface ServiceResult<T> {
  data: T | null
  error: string | null
}

export interface ProjectImageDraft {
  url: string
  caption: string | null
  sort_order: number
}

export interface ProjectVideoDraft {
  title: string | null
  url: string
  sort_order: number
}

interface StoredImage {
  id: string
  url: string
  caption: string | null
  sort_order: number
  created_at: string
}

interface StoredVideo {
  id: string
  title: string | null
  url: string
  sort_order: number
  created_at: string
}

export interface StoredProject extends ProjectRow {
  technology_ids: string[]
  images: StoredImage[]
  videos: StoredVideo[]
}

const PROJECTS_KEY = 'sfaxien.projects'
const CATEGORIES_KEY = 'sfaxien.categories'
const TECHNOLOGIES_KEY = 'sfaxien.technologies'

function readProjects(): StoredProject[] {
  return tableRead<StoredProject>(PROJECTS_KEY)
}

function writeProjects(projects: StoredProject[]): void {
  tableWrite(PROJECTS_KEY, projects)
}

function readCategories(): CategoryRow[] {
  return tableRead<CategoryRow>(CATEGORIES_KEY)
}

function readTechnologies(): TechnologyRow[] {
  return tableRead<TechnologyRow>(TECHNOLOGIES_KEY)
}

function toRelations(raw: StoredProject): ProjectWithRelations {
  const categories = readCategories()
  const technologies = readTechnologies()
  const category = raw.category_id ? categories.find((c) => c.id === raw.category_id) ?? null : null
  const techRows = raw.technology_ids
    .map((id) => technologies.find((t) => t.id === id))
    .filter((t): t is TechnologyRow => Boolean(t))

  const liveShot = raw.live_url ? liveScreenshotUrl(raw.live_url) : null
  const hero_image = raw.hero_image || liveShot
  const thumbnail = raw.thumbnail || raw.hero_image || liveShot

  const images: ProjectImageRow[] = raw.images
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => ({ ...img, project_id: raw.id }))

  const videos: ProjectVideoRow[] = raw.videos
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((vid) => ({ ...vid, project_id: raw.id }))

  return {
    ...raw,
    hero_image,
    thumbnail,
    category,
    technologies: techRows,
    images,
    videos,
  }
}

export interface ListProjectsOptions {
  published?: boolean
  featured?: boolean
  categorySlug?: string | null
  technologySlug?: string | null
  limit?: number
  orderBy?: 'sort' | 'newest'
}

export async function listProjects(
  options: ListProjectsOptions = {},
): Promise<ServiceResult<ProjectWithRelations[]>> {
  let rows = readProjects()

  const showPublished = options.published === undefined ? true : options.published
  if (showPublished) rows = rows.filter((p) => p.published)
  if (options.featured) rows = rows.filter((p) => p.featured)

  if (options.categorySlug) {
    const cat = readCategories().find((c) => c.slug === options.categorySlug)
    if (cat) rows = rows.filter((p) => p.category_id === cat.id)
  }

  if (options.technologySlug) {
    const tech = readTechnologies().find((t) => t.slug === options.technologySlug)
    if (tech) rows = rows.filter((p) => p.technology_ids.includes(tech.id))
  }

  const orderKey = options.orderBy === 'newest' ? 'created_at' : 'sort_order'
  rows = rows.slice().sort((a, b) => {
    const av = (a[orderKey] as string | number) ?? ''
    const bv = (b[orderKey] as string | number) ?? ''
    if (typeof av === 'number' && typeof bv === 'number') return av - bv
    return String(av).localeCompare(String(bv))
  })

  if (options.limit) rows = rows.slice(0, options.limit)

  return { data: rows.map(toRelations), error: null }
}

export async function getProjectBySlug(
  slug: string,
  includeUnpublished = false,
): Promise<ServiceResult<ProjectWithRelations>> {
  const project = readProjects().find((p) => p.slug === slug)
  if (!project || (!includeUnpublished && !project.published)) {
    return { data: null, error: 'Project not found.' }
  }
  return { data: toRelations(project), error: null }
}

export async function getProjectAdmin(id: string): Promise<ServiceResult<ProjectWithRelations>> {
  const project = readProjects().find((p) => p.id === id)
  if (!project) return { data: null, error: 'Project not found.' }
  return { data: toRelations(project), error: null }
}

export interface ProjectEditorPayload {
  title: string
  slug: string
  short_description: string
  description: string
  category_id: string | null
  client: string | null
  year: number | null
  status: string | null
  hero_image: string | null
  thumbnail: string | null
  github_url: string | null
  live_url: string | null
  video_url: string | null
  problem: string
  solution: string
  architecture: string
  features: string
  challenges: string
  results: string
  featured: boolean
  published: boolean
  is_demo: boolean
  sort_order: number
  technology_ids: string[]
  images: ProjectImageDraft[]
  videos: ProjectVideoDraft[]
}

/** Prefix a bare domain like `mysite.com` with https:// so links always open. */
function normalizeUrl(url: string | null): string | null {
  if (!url) return null
  const trimmed = url.trim()
  if (!trimmed) return null
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) return trimmed
  if (trimmed.startsWith('//')) return `https:${trimmed}`
  return `https://${trimmed}`
}

/** Create or update a project AND its relations. */
export async function saveProject(
  payload: ProjectEditorPayload,
  existingId?: string,
): Promise<ServiceResult<ProjectWithRelations>> {
  const timestamp = nowIso()
  const rows = readProjects()
  const existing = existingId ? rows.find((p) => p.id === existingId) : undefined
  const liveUrl = normalizeUrl(payload.live_url)
  const liveShot = liveUrl ? liveScreenshotUrl(liveUrl) : null

  if (payload.slug) {
    const slugTaken = rows.some((p) => p.slug === payload.slug && p.id !== existingId)
    if (slugTaken) return { data: null, error: 'A project with that slug already exists.' }
  }

  const project: StoredProject = {
    id: existing?.id ?? uid(),
    slug: payload.slug,
    title: payload.title,
    short_description: payload.short_description,
    description: payload.description,
    category_id: payload.category_id,
    client: payload.client || null,
    year: payload.year,
    status: payload.status || 'concept',
    hero_image: payload.hero_image || liveShot,
    thumbnail: payload.thumbnail || liveShot,
    github_url: normalizeUrl(payload.github_url),
    live_url: liveUrl,
    video_url: normalizeUrl(payload.video_url),
    problem: payload.problem,
    solution: payload.solution,
    architecture: payload.architecture,
    features: payload.features,
    challenges: payload.challenges,
    results: payload.results,
    featured: payload.featured,
    published: payload.published,
    is_demo: payload.is_demo,
    sort_order: payload.sort_order,
    created_at: existing?.created_at ?? timestamp,
    updated_at: timestamp,
    technology_ids: payload.technology_ids,
    images: payload.images.map((img) => ({
      id: uid(),
      url: img.url,
      caption: img.caption,
      sort_order: img.sort_order,
      created_at: timestamp,
    })),
    videos: payload.videos.map((vid) => ({
      id: uid(),
      title: vid.title,
      url: vid.url,
      sort_order: vid.sort_order,
      created_at: timestamp,
    })),
  }

  tableUpsert(PROJECTS_KEY, project)
  return { data: toRelations(project), error: null }
}

export async function deleteProject(id: string): Promise<ServiceResult<null>> {
  tableDelete(PROJECTS_KEY, id)
  return { data: null, error: null }
}

export async function duplicateProject(id: string): Promise<ServiceResult<string>> {
  const source = readProjects().find((p) => p.id === id)
  if (!source) return { data: null, error: 'Could not load the source project.' }

  const slug = `${source.slug}-copy-${Date.now().toString(36)}`
  const copy: ProjectEditorPayload = {
    title: `${source.title} (Copy)`,
    slug,
    short_description: source.short_description,
    description: source.description,
    category_id: source.category_id,
    client: source.client,
    year: source.year,
    status: source.status,
    hero_image: source.hero_image,
    thumbnail: source.thumbnail,
    github_url: source.github_url,
    live_url: source.live_url,
    video_url: source.video_url,
    problem: source.problem ?? '',
    solution: source.solution ?? '',
    architecture: source.architecture ?? '',
    features: source.features ?? '',
    challenges: source.challenges ?? '',
    results: source.results ?? '',
    featured: false,
    published: false,
    is_demo: source.is_demo,
    sort_order: (source.sort_order ?? 0) + 1,
    technology_ids: source.technology_ids,
    images: source.images.map((img) => ({ url: img.url, caption: img.caption, sort_order: img.sort_order })),
    videos: source.videos.map((vid) => ({ title: vid.title, url: vid.url, sort_order: vid.sort_order })),
  }

  const result = await saveProject(copy)
  if (result.error || !result.data) return { data: null, error: result.error }
  return { data: result.data.id, error: null }
}

export async function setProjectFlag(
  id: string,
  flag: 'featured' | 'published',
  value: boolean,
): Promise<ServiceResult<null>> {
  const rows = readProjects()
  const index = rows.findIndex((p) => p.id === id)
  if (index < 0) return { data: null, error: 'Project not found.' }
  rows[index] = {
    ...rows[index],
    [flag]: value,
    updated_at: nowIso(),
  }
  writeProjects(rows)
  return { data: null, error: null }
}

export async function reorderProjects(orderedIds: string[]): Promise<ServiceResult<null>> {
  const rows = readProjects()
  const orderMap = new Map(orderedIds.map((id, index) => [id, index + 1]))
  const next = rows.map((p) => {
    const sortOrder = orderMap.get(p.id)
    return sortOrder === undefined ? p : { ...p, sort_order: sortOrder, updated_at: nowIso() }
  })
  writeProjects(next)
  return { data: null, error: null }
}

export async function countProjects(): Promise<{ total: number; published: number; drafts: number; featured: number }> {
  const rows = readProjects()
  return {
    total: rows.length,
    published: rows.filter((p) => p.published).length,
    drafts: rows.filter((p) => !p.published).length,
    featured: rows.filter((p) => p.featured).length,
  }
}