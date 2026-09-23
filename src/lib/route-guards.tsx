import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAdmin, useAdminSession, useAdminLoading, isEditorRole, isAdminRole } from '@/providers/AdminProvider'

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background" role="status" aria-label="Loading">
      <Loader2 className="h-7 w-7 animate-spin text-primary" />
    </div>
  )
}

/**
 * Requires an active admin/editor session. Redirects to /admin-sec
 * (the login route) when unauthenticated.
 */
export function RequireAdmin() {
  const loading = useAdminLoading()
  const session = useAdminSession()
  const location = useLocation()

  if (loading) return <FullScreenLoader />
  if (!session || !isEditorRole(session.role)) {
    return <Navigate to="/admin-sec" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}

/**
 * Only admins may access the wrapped route. Editors and visitors are sent to
 * the dashboard.
 */
export function RequireAdminOnly({ children }: { children: React.ReactNode }) {
  const loading = useAdminLoading()
  const session = useAdminSession()

  if (loading) return <FullScreenLoader />
  if (!session || !isAdminRole(session.role)) {
    return <Navigate to="/admin-sec/dashboard" replace />
  }
  return <>{children}</>
}

/**
 * The /admin-sec login page — redirects already-authenticated users to the
 * dashboard.
 */
export function GuestOnly() {
  const { loading } = useAdmin()
  const session = useAdminSession()

  if (loading) return <FullScreenLoader />
  if (session) return <Navigate to="/admin-sec/dashboard" replace />
  return <Outlet />
}