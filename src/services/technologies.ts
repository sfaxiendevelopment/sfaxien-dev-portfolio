import { tableRead, tableWrite, tableUpsert, tableDelete, uid, nowIso } from '@/lib/local-store'
import type { TechnologyRow } from '@/types'
import type { ServiceResult } from './projects'

const KEY = 'sfaxien.technologies'

export async function listTechnologies(): Promise<ServiceResult<TechnologyRow[]>> {
  const rows = tableRead<TechnologyRow>(KEY).sort((a, b) => a.name.localeCompare(b.name))
  return { data: rows, error: null }
}

export async function upsertTechnology(input: {
  id?: string
  name: string
  slug: string
}): Promise<ServiceResult<TechnologyRow>> {
  const id = input.id ?? uid()
  const existing = tableRead<TechnologyRow>(KEY)
  const prev = existing.find((row) => row.id === id)?.created_at ?? nowIso()
  const row: TechnologyRow = { id, name: input.name, slug: input.slug, created_at: prev }
  tableUpsert(KEY, row)
  return { data: row, error: null }
}

export async function deleteTechnology(id: string): Promise<ServiceResult<null>> {
  tableDelete(KEY, id)
  const projects = tableRead<import('@/types').ProjectRow & { technology_ids?: string[] }>(
    'sfaxien.projects',
  ).map((p) =>
    p.technology_ids?.includes(id)
      ? { ...p, technology_ids: p.technology_ids.filter((techId) => techId !== id), updated_at: nowIso() }
      : p,
  )
  tableWrite('sfaxien.projects', projects)
  return { data: null, error: null }
}