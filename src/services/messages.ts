import { tableRead, tableUpsert, tableDelete, tableWrite } from '@/lib/local-store'
import type { ContactMessageRow } from '@/types'
import type { ServiceResult } from './projects'

const KEY = 'sfaxien.messages'

export async function listMessages(): Promise<ServiceResult<ContactMessageRow[]>> {
  const rows = tableRead<ContactMessageRow>(KEY).sort((a, b) => b.created_at.localeCompare(a.created_at))
  return { data: rows, error: null }
}

export async function updateMessageStatus(
  id: string,
  status: 'new' | 'read' | 'archived',
): Promise<ServiceResult<null>> {
  const row = tableRead<ContactMessageRow>(KEY).find((m) => m.id === id)
  if (row) tableUpsert(KEY, { ...row, status })
  return { data: null, error: null }
}

export async function markAllMessagesRead(): Promise<ServiceResult<null>> {
  const rows = tableRead<ContactMessageRow>(KEY).map((m) =>
    m.status === 'new' ? { ...m, status: 'read' as const } : m,
  )
  tableWrite(KEY, rows)
  return { data: null, error: null }
}

export async function deleteMessage(id: string): Promise<ServiceResult<null>> {
  tableDelete(KEY, id)
  return { data: null, error: null }
}

export async function unreadMessagesCount(): Promise<number> {
  return tableRead<ContactMessageRow>(KEY).filter((m) => m.status === 'new').length
}

export const isContactConfigured = () => true