import { tableRead, tableUpsert, tableDelete, tableWrite } from '@/lib/local-store'
import { cloudFetchMessages, cloudPutMessages, getCloudToken } from '@/lib/cloud'
import type { ContactMessageRow } from '@/types'
import type { ServiceResult } from './projects'

const KEY = 'sfaxien.messages'

async function pushToCloud(rows: ContactMessageRow[]): Promise<void> {
  if (!getCloudToken()) return
  await cloudPutMessages(rows)
}

export async function listMessages(): Promise<ServiceResult<ContactMessageRow[]>> {
  const remote = await cloudFetchMessages<ContactMessageRow>()
  if (remote) tableWrite(KEY, remote)
  const rows = tableRead<ContactMessageRow>(KEY).sort((a, b) => b.created_at.localeCompare(a.created_at))
  return { data: rows, error: null }
}

export async function updateMessageStatus(
  id: string,
  status: 'new' | 'read' | 'archived',
): Promise<ServiceResult<null>> {
  const all = tableRead<ContactMessageRow>(KEY)
  const row = all.find((m) => m.id === id)
  if (!row) return { data: null, error: 'Message not found.' }
  const next = all.map((m) => (m.id === id ? { ...m, status } : m))
  tableWrite(KEY, next)
  tableUpsert(KEY, { ...row, status })
  await pushToCloud(next)
  return { data: null, error: null }
}

export async function markAllMessagesRead(): Promise<ServiceResult<null>> {
  const rows = tableRead<ContactMessageRow>(KEY).map((m) =>
    m.status === 'new' ? { ...m, status: 'read' as const } : m,
  )
  tableWrite(KEY, rows)
  await pushToCloud(rows)
  return { data: null, error: null }
}

export async function deleteMessage(id: string): Promise<ServiceResult<null>> {
  const rows = tableRead<ContactMessageRow>(KEY).filter((m) => m.id !== id)
  tableWrite(KEY, rows)
  tableDelete(KEY, id)
  await pushToCloud(rows)
  return { data: null, error: null }
}

export async function unreadMessagesCount(): Promise<number> {
  return tableRead<ContactMessageRow>(KEY).filter((m) => m.status === 'new').length
}

export const isContactConfigured = () => true
