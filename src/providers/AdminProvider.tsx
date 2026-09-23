import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { getCurrentSession, onAuthStateChange, signOut as signOutSession } from '@/lib/auth'
import type { AdminSession } from '@/types'

interface AdminContextValue {
  session: AdminSession | null
  loading: boolean
  refresh: () => Promise<void>
  logout: () => Promise<void>
}

const AdminContext = createContext<AdminContextValue | undefined>(undefined)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setSession(await getCurrentSession())
  }, [])

  useEffect(() => {
    let mounted = true
    setLoading(true)
    ;(async () => {
      const current = await getCurrentSession()
      if (mounted) {
        setSession(current)
        setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    return onAuthStateChange((next) => setSession(next))
  }, [])

  const logout = useCallback(async () => {
    await signOutSession()
    setSession(null)
  }, [])

  return (
    <AdminContext.Provider value={{ session, loading, refresh, logout }}>{children}</AdminContext.Provider>
  )
}

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within an AdminProvider')
  return ctx
}

export function useAdminSession(): AdminSession | null {
  return useAdmin().session
}

export function useAdminLoading(): boolean {
  return useAdmin().loading
}

export function isAdminRole(role: AdminSession['role']): boolean {
  return role === 'admin'
}

export function isEditorRole(role: AdminSession['role']): boolean {
  return role === 'admin' || role === 'editor'
}