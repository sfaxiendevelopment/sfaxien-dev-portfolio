import { tableRead, tableWrite, tableUpsert, tableDelete, uid, nowIso } from '@/lib/local-store'
import type { CategoryRow } from '@/types'
import type { ServiceResult } from './projects'

const KEY = 'sfaxien.categories'

export async function listCategories(): Promise<ServiceResult<CategoryRow[]>> {
  const rows = tableRead<CategoryRow>(KEY).sort((a, b) => a.name.localeCompare(b.name))
  return { data: rows, error: null }
}

export async function upsertCategory(input: {
  id?: string
  name: string
  slug: string
}): Promise<ServiceResult<CategoryRow>> {
  const id = input.id ?? uid()
  const existing = tableRead<CategoryRow>(KEY)
  const prev = existing.find((row) => row.id === id)?.created_at ?? nowIso()
  const row: CategoryRow = { id, name: input.name, slug: input.slug, created_at: prev }
  tableUpsert(KEY, row)
  return { data: row, error: null }
}

export async function deleteCategory(id: string): Promise<ServiceResult<null>> {
  tableDelete(KEY, id)
  const projects = tableRead<import('@/types').ProjectRow>('sfaxien.projects').map((p) =>
    p.category_id === id ? { ...p, category_id: null, updated_at: nowIso() } : p,
  )
  tableWrite('sfaxien.projects', projects)
  return { data: null, error: null }
}