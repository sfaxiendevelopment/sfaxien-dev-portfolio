import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listProjects,
  getProjectBySlug,
  getProjectAdmin,
  saveProject,
  deleteProject,
  duplicateProject,
  setProjectFlag,
  reorderProjects,
  type ProjectEditorPayload,
  type ListProjectsOptions,
} from '@/services/projects'

export const projectKeys = {
  all: ['projects'] as const,
  lists: ['projects', 'list'] as const,
  list: (options: ListProjectsOptions) => ['projects', 'list', options] as const,
  published: (slug: string) => ['projects', 'published', slug] as const,
  admin: (id: string) => ['projects', 'admin', id] as const,
  counts: ['projects', 'counts'] as const,
}

export function useProjects(options: ListProjectsOptions = {}) {
  return useQuery({
    queryKey: projectKeys.list(options),
    queryFn: () => listProjects(options),
    select: (result) => result,
  })
}

export function useFeaturedProjects(limit = 4) {
  return useProjects({ featured: true, limit })
}

export function usePublishedProject(slug: string) {
  return useQuery({
    queryKey: projectKeys.published(slug),
    queryFn: () => getProjectBySlug(slug),
    enabled: Boolean(slug),
  })
}

export function useAdminProject(id: string | undefined) {
  return useQuery({
    queryKey: projectKeys.admin(id ?? ''),
    queryFn: () => getProjectAdmin(id as string),
    enabled: Boolean(id),
  })
}

export function useAdminProjects() {
  return useProjects({ published: false })
}

export function useSaveProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ payload, id }: { payload: ProjectEditorPayload; id?: string }) =>
      saveProject(payload, id),
    onSuccess: () => {
      return Promise.all([
        qc.invalidateQueries({ queryKey: projectKeys.all }),
        qc.invalidateQueries({ queryKey: projectKeys.counts }),
      ])
    },
  })
}

export function useDeleteProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: projectKeys.all }),
        qc.invalidateQueries({ queryKey: projectKeys.counts }),
      ]),
  })
}

export function useDuplicateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => duplicateProject(id),
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: projectKeys.all }),
        qc.invalidateQueries({ queryKey: projectKeys.counts }),
      ]),
  })
}

export function useSetProjectFlag() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, flag, value }: { id: string; flag: 'featured' | 'published'; value: boolean }) =>
      setProjectFlag(id, flag, value),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: projectKeys.all })
      void qc.invalidateQueries({ queryKey: projectKeys.counts })
    },
  })
}

export function useReorderProjects() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (orderedIds: string[]) => reorderProjects(orderedIds),
    onSuccess: () => void qc.invalidateQueries({ queryKey: projectKeys.all }),
  })
}