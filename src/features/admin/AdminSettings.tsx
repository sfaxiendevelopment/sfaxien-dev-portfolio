import { Settings, ShieldCheck, KeyRound, Wifi, Server, Database, User, HardDrive } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { useAdminSession, useAdmin, isAdminRole } from '@/providers/AdminProvider'
import { siteUrl } from '@/lib/media'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function AdminSettings() {
  const session = useAdminSession()
  const { loading } = useAdmin()

  return (
    <div>
      <AdminPageHeader
        title="Settings"
        description="Your admin session and the site's local storage configuration."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" /> Admin session
            </CardTitle>
            <CardDescription>Who is signed in on this device.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="py-6 text-center font-mono text-xs text-muted-foreground">Loading session…</p>
            ) : session ? (
              <dl className="divide-y divide-border/70 text-sm">
                <div className="flex items-center justify-between gap-6 py-3">
                  <dt className="text-muted-foreground">Username</dt>
                  <dd className="flex items-center gap-2 font-medium text-foreground">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    {session.username ?? '—'}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-6 py-3">
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="truncate font-mono text-xs text-foreground">{session.email || '—'}</dd>
                </div>
                <div className="flex items-center justify-between gap-6 py-3">
                  <dt className="text-muted-foreground">Role</dt>
                  <dd>
                    <Badge variant={isAdminRole(session.role) ? 'accent' : 'secondary'}>{session.role}</Badge>
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-6 py-3">
                  <dt className="text-muted-foreground">Session ID</dt>
                  <dd className="max-w-[14rem] truncate font-mono text-[10px] text-muted-foreground">{session.id}</dd>
                </div>
              </dl>
            ) : (
              <p className="py-6 text-center font-mono text-xs text-muted-foreground">Not signed in.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" /> Storage configuration
            </CardTitle>
            <CardDescription>Where the CMS keeps its data.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 rounded-lg border border-border/70 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
                <Wifi className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">Connected</p>
                <p className="text-xs text-muted-foreground">
                  All CMS data lives in this browser — no external database required.
                </p>
              </div>
            </div>

            <dl className="mt-4 divide-y divide-border/70 text-sm">
              <div className="flex items-center justify-between gap-6 py-3">
                <dt className="text-muted-foreground">Records</dt>
                <dd className="font-mono text-xs text-foreground">localStorage</dd>
              </div>
              <div className="flex items-center justify-between gap-6 py-3">
                <dt className="text-muted-foreground">Media library</dt>
                <dd className="font-mono text-xs text-foreground">IndexedDB</dd>
              </div>
              <div className="flex items-center justify-between gap-6 py-3">
                <dt className="text-muted-foreground">Public URL</dt>
                <dd className="max-w-[16rem] truncate font-mono text-[10px] text-muted-foreground">{siteUrl}</dd>
              </div>
              <div className="flex items-center justify-between gap-6 py-3">
                <dt className="text-muted-foreground">Environment</dt>
                <dd>
                  <Badge variant="secondary">
                    {import.meta.env.DEV ? 'development' : import.meta.env.PROD ? 'production' : 'unknown'}
                  </Badge>
                </dd>
              </div>
            </dl>

            <div className="mt-2 flex items-center gap-3 rounded-lg border border-dashed border-border/70 p-4">
              <KeyRound className="h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                Sign out and reselect the session from the sidebar to switch accounts.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-4 w-4 text-primary" /> Access
            </CardTitle>
            <CardDescription>How the local CMS is protected.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  role: 'admin',
                  desc: 'Full access: manages projects, media, taxonomy, messages and settings.',
                },
                {
                  role: 'editor',
                  desc: 'Manages projects, media, categories, technologies and messages. No settings.',
                },
                {
                  role: 'viewer',
                  desc: 'Read-only access to the admin dashboard and messages.',
                },
              ].map((r) => (
                <div key={r.role} className="rounded-lg border border-border/70 p-4">
                  <p className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-primary">
                    <ShieldCheck className="h-3.5 w-3.5" /> {r.role}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{r.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between gap-4 rounded-lg border border-border/70 p-4">
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <HardDrive className="h-4 w-4 shrink-0 text-primary" />
                This build runs a fully local CMS. Admin credentials are configured via environment variables
                (<span className="font-mono text-xs">VITE_ADMIN_*</span> in .env).
              </p>
              <span className="flex shrink-0 items-center gap-2 font-mono text-[11px] text-muted-foreground">
                <Settings className="h-3.5 w-3.5" /> admin-sec/settings
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}