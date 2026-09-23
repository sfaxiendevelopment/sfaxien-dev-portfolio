import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listMessages,
  updateMessageStatus,
  deleteMessage,
  markAllMessagesRead,
  unreadMessagesCount,
} from '@/services/messages'
import { countProjects } from '@/services/projects'

export const adminKeys = {
  messages: ['admin', 'messages'] as const,
  counts: ['admin', 'counts'] as const,
}

export function useAdminMessages() {
  return useQuery({ queryKey: adminKeys.messages, queryFn: listMessages })
}

export function useAdminCounts() {
  return useQuery({
    queryKey: adminKeys.counts,
    queryFn: async () => {
      const [projects, unread] = await Promise.all([countProjects(), unreadMessagesCount()])
      return { ...projects, unread }
    },
    refetchInterval: 60_000,
  })
}

export function useUpdateMessageStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'new' | 'read' | 'archived' }) =>
      updateMessageStatus(id, status),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminKeys.messages })
      void qc.invalidateQueries({ queryKey: adminKeys.counts })
    },
  })
}

export function useDeleteMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteMessage(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminKeys.messages })
      void qc.invalidateQueries({ queryKey: adminKeys.counts })
    },
  })
}

export function useMarkAllMessagesRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => markAllMessagesRead(),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminKeys.messages })
      void qc.invalidateQueries({ queryKey: adminKeys.counts })
    },
  })
}