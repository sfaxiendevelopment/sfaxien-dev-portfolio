import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listCategories, upsertCategory, deleteCategory } from '@/services/categories'
import { listTechnologies, upsertTechnology, deleteTechnology } from '@/services/technologies'

export const taxonomyKeys = {
  categories: ['categories'] as const,
  technologies: ['technologies'] as const,
}

export function useCategories() {
  return useQuery({ queryKey: taxonomyKeys.categories, queryFn: listCategories })
}

export function useSaveCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { id?: string; name: string; slug: string }) => upsertCategory(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: taxonomyKeys.categories }),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: taxonomyKeys.categories }),
  })
}

export function useTechnologies() {
  return useQuery({ queryKey: taxonomyKeys.technologies, queryFn: listTechnologies })
}

export function useSaveTechnology() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { id?: string; name: string; slug: string }) => upsertTechnology(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: taxonomyKeys.technologies }),
  })
}

export function useDeleteTechnology() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteTechnology(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: taxonomyKeys.technologies }),
  })
}