import { useEffect, useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderKanban,
  Plus,
  Image,
  Tags,
  Cpu,
  Mail,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  Loader2,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdminSession, useAdmin, isAdminRole } from '@/providers/AdminProvider'
import { useAdminCounts } from '@/hooks/use-admin'
import { Wordmark } from '@/components/brand/Logo'
import { SidebarSection, SidebarLink } from '@/components/admin/SidebarItem'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { usePrefersReducedMotion } from '@/hooks/use-media'

export function AdminLayout() {
  const session = useAdminSession()
  const { logout } = useAdmin()
  const navigate = useNavigate()
  const location = useLocation()
  const counts = useAdminCounts()
  const reduced = usePrefersReducedMotion()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  if (!session) return null

  async function handleLogout() {
    setLoggingOut(true)
    await logout()
    navigate('/admin-sec')
  }

  const nav = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-border/70 px-5">
        <Link to="/admin-sec/dashboard" className="flex items-center gap-2.5">
          <Wordmark />
        </Link>
        <Badge variant="secondary" className="ml-auto font-mono text-[10px] uppercase">
          CMS
        </Badge>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        <SidebarSection label="Manage">
          <SidebarLink to="/admin-sec/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" end />
          <SidebarLink to="/admin-sec/projects" icon={<FolderKanban className="h-4 w-4" />} label="Projects" />
          <SidebarLink to="/admin-sec/projects/new" icon={<Plus className="h-4 w-4" />} label="Add Project" />
          <SidebarLink to="/admin-sec/media" icon={<Image className="h-4 w-4" />} label="Media" />
          <SidebarLink to="/admin-sec/categories" icon={<Tags className="h-4 w-4" />} label="Categories" />
          <SidebarLink to="/admin-sec/technologies" icon={<Cpu className="h-4 w-4" />} label="Technologies" />
          <SidebarLink
            to="/admin-sec/messages"
            icon={<Mail className="h-4 w-4" />}
            label="Messages"
            trailing={
              (counts.data?.unread ?? 0) > 0 ? (
                <span className="ml-auto inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1.5 py-0.5 font-mono text-[10px] font-semibold text-primary-foreground">
                  {counts.data?.unread}
                </span>
              ) : null
            }
          />
        </SidebarSection>
        <SidebarSection label="System">
          {isAdminRole(session.role) && (
            <SidebarLink to="/admin-sec/settings" icon={<Settings className="h-4 w-4" />} label="Settings" />
          )}
        </SidebarSection>
      </nav>

      <div className="border-t border-border/70 p-3">
        <Link
          to="/"
          target="_blank"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent/10 hover:text-accent"
        >
          <ExternalLink className="h-4 w-4" />
          View site
        </Link>
        <div className="mt-2 flex items-center gap-3 rounded-lg bg-secondary/40 px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/40 bg-primary/15 text-primary">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-mono text-xs font-medium text-foreground">{session.username ?? 'admin'}</p>
            <p className="truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {session.role}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-8 w-8"
            onClick={handleLogout}
            disabled={loggingOut}
            aria-label="Sign out"
          >
            {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-border/70 lg:block">
        {nav}
      </aside>

      {/* Mobile sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0 sm:max-w-64">
          <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          {nav}
        </SheetContent>
      </Sheet>

      <div className="lg:pl-60">
        {/* Mobile topbar */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border/70 bg-background/85 px-4 backdrop-blur lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-mono text-sm font-medium uppercase tracking-widest text-foreground">Admin</span>
        </header>

        <main className={cn('p-5 md:p-8', reduced ? '' : 'animate-in fade-in-0 duration-200')}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}