export interface ProjectRow {
  id: string
  slug: string
  title: string
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
  problem: string | null
  solution: string | null
  architecture: string | null
  features: string | null
  challenges: string | null
  results: string | null
  featured: boolean
  published: boolean
  is_demo: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface CategoryRow {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface TechnologyRow {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface ProjectImageRow {
  id: string
  project_id: string
  url: string
  caption: string | null
  sort_order: number
  created_at: string
}

export interface ProjectVideoRow {
  id: string
  project_id: string
  title: string | null
  url: string
  sort_order: number
  created_at: string
}

export interface ContactMessageRow {
  id: string
  name: string
  email: string
  project_type: string
  budget: string | null
  message: string
  status: 'new' | 'read' | 'archived'
  ip_hash: string | null
  created_at: string
}

export type ProjectStatus = 'completed' | 'in-progress' | 'archived' | 'concept' | string

export interface ProjectWithRelations extends ProjectRow {
  category: CategoryRow | null
  technologies: TechnologyRow[]
  images: ProjectImageRow[]
  videos: ProjectVideoRow[]
}

export type AdminRole = 'admin' | 'editor' | 'viewer'

export interface AdminSession {
  id: string
  email: string
  username: string | null
  role: AdminRole
}

export interface ContactFormPayload {
  name: string
  email: string
  projectType: string
  budget: string
  message: string
}

export interface ContactFormResult {
  ok: boolean
  error?: string
}

export const PROJECT_TYPES = [
  'Web Application',
  'FiveM Server / Resource',
  'Game',
  'UI/UX',
  'AI Integration',
  'Mobile',
  'Other',
] as const

export const BUDGET_RANGES = [
  'Under $1,000',
  '$1,000 – $5,000',
  '$5,000 – $15,000',
  '$15,000+',
] as const

export const PROJECT_STATUS_OPTIONS = [
  { value: 'completed', label: 'Completed' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'archived', label: 'Archived' },
  { value: 'concept', label: 'Concept' },
] as const

export interface MessageStats {
  total: number
  new: number
  read: number
}