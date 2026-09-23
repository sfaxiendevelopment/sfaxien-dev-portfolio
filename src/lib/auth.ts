import { uid } from '@/lib/local-store'
import type { AdminSession } from '@/types'

export interface AuthError {
  message: string
  code?: string
}

const SESSION_KEY = 'sfaxien.admin.session'
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

interface PersistedSession extends AdminSession {
  display_name: string | null
  expiresAt: number
}

const adminConfig = {
  email: (import.meta.env.VITE_ADMIN_EMAIL as string | undefined) || 'sfaxiendevlopment@gmail.com',
  username: (import.meta.env.VITE_ADMIN_USERNAME as string | undefined) || 'SFAXIENYESSINEDEV@2005',
  password: (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) || 'SFAXIENDEVYESSINE@2005@DEV',
  displayName: (import.meta.env.VITE_ADMIN_DISPLAY_NAME as string | undefined) || 'Sfaxien Dev',
}

function toSession(persisted: PersistedSession): AdminSession {
  return {
    id: persisted.id,
    email: persisted.email,
    username: persisted.username,
    role: persisted.role,
  }
}

function readSession(): AdminSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const persisted = JSON.parse(raw) as PersistedSession
    if (!persisted.expiresAt || persisted.expiresAt < Date.now()) {
      window.localStorage.removeItem(SESSION_KEY)
      return null
    }
    return toSession(persisted)
  } catch {
    return null
  }
}

function persistSession(session: PersistedSession): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

type AuthListener = (session: AdminSession | null) => void
const listeners = new Set<AuthListener>()

function notify(next: AdminSession | null): void {
  for (const listener of listeners) listener(next)
}

export async function signInWithUsernameOrEmail(
  identifier: string,
  password: string,
): Promise<{ session: AdminSession | null; error: AuthError | null }> {
  const trimmed = identifier.trim()
  if (!trimmed || !password) {
    return { session: null, error: { message: 'Username and password are required.' } }
  }

  const identifierMatches =
    trimmed.toLowerCase() === adminConfig.username.toLowerCase() ||
    trimmed.toLowerCase() === adminConfig.email.toLowerCase()
  const passwordMatches = password === adminConfig.password

  if (!identifierMatches || !passwordMatches) {
    return { session: null, error: { message: 'Invalid credentials.' } }
  }

  const session: PersistedSession = {
    id: uid(),
    email: adminConfig.email,
    username: adminConfig.username,
    role: 'admin',
    display_name: adminConfig.displayName,
    expiresAt: Date.now() + SESSION_TTL_MS,
  }

  persistSession(session)
  notify(toSession(session))
  return { session: toSession(session), error: null }
}

export async function fetchAdminSession(userId: string | null | undefined): Promise<AdminSession | null> {
  if (!userId) return null
  return getCurrentSession()
}

export async function isAdminUser(): Promise<boolean> {
  const session = readSession()
  return session?.role === 'admin'
}

export async function getCurrentSession(): Promise<AdminSession | null> {
  return readSession()
}

export async function signOut(): Promise<void> {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(SESSION_KEY)
  notify(null)
}

export function onAuthStateChange(callback: (session: AdminSession | null) => void): () => void {
  listeners.add(callback)
  void getCurrentSession().then(callback)

  const onStorage = (event: StorageEvent) => {
    if (event.key === SESSION_KEY) callback(readSession())
  }
  window.addEventListener('storage', onStorage)

  return () => {
    listeners.delete(callback)
    window.removeEventListener('storage', onStorage)
  }
}