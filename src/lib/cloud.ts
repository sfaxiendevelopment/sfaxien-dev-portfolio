const TOKEN_KEY = 'sfaxien.cloud.token'
const BASE = '/api'

let token: string | null = null

try {
  token = window.localStorage.getItem(TOKEN_KEY)
} catch {
  token = null
}

export function getCloudToken(): string | null {
  return token
}

export function setCloudToken(next: string | null): void {
  token = next
  try {
    if (next) window.localStorage.setItem(TOKEN_KEY, next)
    else window.localStorage.removeItem(TOKEN_KEY)
  } catch {
    return
  }
}

export type CloudLoginResult =
  | { status: 'ok'; username: string }
  | { status: 'invalid' }
  | { status: 'unavailable' }

export async function cloudLogin(username: string, password: string): Promise<CloudLoginResult> {
  try {
    const response = await fetch(`${BASE}/admin/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (response.status === 401) return { status: 'invalid' }
    if (!response.ok) return { status: 'unavailable' }
    const data = (await response.json()) as { token?: string; username?: string }
    if (!data.token) return { status: 'unavailable' }
    setCloudToken(data.token)
    return { status: 'ok', username: data.username ?? username }
  } catch {
    return { status: 'unavailable' }
  }
}

export interface CloudContent {
  projects: unknown[]
  categories: unknown[]
  technologies: unknown[]
}

export async function cloudFetchContent(): Promise<CloudContent | null> {
  try {
    const response = await fetch(`${BASE}/content`, { headers: { accept: 'application/json' } })
    if (!response.ok) return null
    const data = (await response.json()) as Partial<CloudContent>
    return {
      projects: Array.isArray(data.projects) ? data.projects : [],
      categories: Array.isArray(data.categories) ? data.categories : [],
      technologies: Array.isArray(data.technologies) ? data.technologies : [],
    }
  } catch {
    return null
  }
}

export async function cloudPutTable(table: string, value: unknown[]): Promise<boolean> {
  if (!token) return false
  try {
    const response = await fetch(`${BASE}/admin/table/${table}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify(value),
    })
    return response.ok
  } catch {
    return false
  }
}

export async function cloudFetchMessages<T>(): Promise<T[] | null> {
  if (!token) return null
  try {
    const response = await fetch(`${BASE}/admin/messages`, {
      headers: { accept: 'application/json', authorization: `Bearer ${token}` },
    })
    if (!response.ok) return null
    const data = (await response.json()) as { data?: T[] }
    return Array.isArray(data.data) ? data.data : []
  } catch {
    return null
  }
}

export async function cloudPutMessages(value: unknown[]): Promise<boolean> {
  if (!token) return false
  try {
    const response = await fetch(`${BASE}/admin/messages`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify(value),
    })
    return response.ok
  } catch {
    return false
  }
}

export async function cloudPostContact(payload: Record<string, string>): Promise<boolean> {
  try {
    const response = await fetch(`${BASE}/contact`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return response.ok
  } catch {
    return false
  }
}