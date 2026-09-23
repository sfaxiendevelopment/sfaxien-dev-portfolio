import { useCallback, useEffect, useState } from 'react'
import {
  Settings,
  ShieldCheck,
  KeyRound,
  Wifi,
  WifiOff,
  Server,
  Database,
  User,
  HardDrive,
  Cloud,
  UploadCloud,
  DownloadCloud,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { useAdminSession, useAdmin, isAdminRole } from '@/providers/AdminProvider'
import { siteUrl } from '@/lib/media'
import { hydrateFromCloud, publishContentToCloud, tableRead, exportContent, importContent } from '@/lib/local-store'
import type { ContentBundle } from '@/lib/local-store'
import { cloudFetchContent, getCloudToken } from '@/lib/cloud'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

type CloudState = 'checking' | 'online' | 'offline'

export default function AdminSettings() {
  const session = useAdminSession()
  const { loading } = useAdmin()
  const [cloudState, setCloudState] = useState<CloudState>('checking')
  const [busy, setBusy] = useState<'publish' | 'pull' | null>(null)
  const [counts, setCounts] = useState({ projects: 0, categories: 0, technologies: 0 })

  const refreshCounts = useCallback(() => {
    setCounts({
      projects: tableRead('sfaxien.projects').length,
      categories: tableRead('sfaxien.categories').length,
      technologies: tableRead('sfaxien.technologies').length,
    })
  }, [])

  useEffect(() => {
    refreshCounts()
    let active = true
    void cloudFetchContent().then((content) => {
      if (active) setCloudState(content ? 'online' : 'offline')
    })
    return () => {
      active = false
    }
  }, [refreshCounts])

  async function handlePublish() {
    setBusy('publish')
    try {
      const result = await publishContentToCloud()
      if (result.ok) {
        toast.success('Published to Cloudflare KV.', {
          description: `${result.counts.projects} projects · ${result.counts.categories} categories · ${result.counts.technologies} technologies`,
        })
      } else {
        toast.error('Publish failed. Sign in again and retry.')
      }
    } finally {
      setBusy(null)
    }
  }

  async function handlePull() {
    setBusy('pull')
    try {
      const ok = await hydrateFromCloud()
      if (ok) {
        refreshCounts()
        toast.success('Pulled the latest content from the cloud.')
      } else {
        toast.error('Could not reach the content service.')
      }
    } finally {
      setBusy(null)
    }
  }

  function handleExport() {
    const bundle = exportContent()
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `sfaxien-content-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${bundle.projects.length} projects.`)
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setBusy('pull')
    try {
      const parsed = JSON.parse(await file.text()) as Partial<ContentBundle>
      const counts = importContent(parsed)
      refreshCounts()
      toast.success(`Imported ${counts.projects} projects. Publish to share them.`)
    } catch {
      toast.error('That file is not a valid content export.')
    } finally {
      setBusy(null)
    }
  }

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
            <CardDescription>Cloudflare KV is the source of truth; this browser is a fast cache.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 rounded-lg border border-border/70 p-4">
              <div
                className={
                  cloudState === 'online'
                    ? 'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                    : 'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-400'
                }
              >
                {cloudState === 'offline' ? <WifiOff className="h-5 w-5" /> : <Wifi className="h-5 w-5" />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {cloudState === 'checking'
                    ? 'Checking connection…'
                    : cloudState === 'online'
                      ? 'Cloudflare KV connected'
                      : 'Content service unavailable'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {cloudState === 'online'
                    ? 'Edits save to the cloud and appear for every visitor.'
                    : 'Running on the local cache only. Deploy the Worker to enable sharing.'}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={handlePublish} disabled={busy !== null || !getCloudToken()}>
                {busy === 'publish' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UploadCloud className="mr-2 h-4 w-4" />
                )}
                Publish now
              </Button>
              <Button variant="outline" onClick={handlePull} disabled={busy !== null}>
                {busy === 'pull' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <DownloadCloud className="mr-2 h-4 w-4" />
                )}
                Pull latest
              </Button>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              <Button variant="outline" onClick={handleExport} disabled={busy !== null}>
                <DownloadCloud className="mr-2 h-4 w-4" />
                Export JSON
              </Button>
              <Label className="inline-flex cursor-pointer items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent">
                <UploadCloud className="mr-2 h-4 w-4" />
                Import JSON
                <input
                  type="file"
                  accept="application/json"
                  className="sr-only"
                  onChange={(event) => void handleImport(event)}
                  disabled={busy !== null}
                />
              </Label>
            </div>

            <p className="mt-2 text-xs text-muted-foreground">
              Use <span className="font-medium text-foreground">Export</span> on one device and{' '}
              <span className="font-medium text-foreground">Import</span> on another to move projects between
              localhost and the hosted site.
            </p>

            <p className="mt-3 text-xs text-muted-foreground">
              Use <span className="font-medium text-foreground">Publish now</span> to push the content in this browser
              to the cloud. Once you are signed in, every edit publishes automatically.
            </p>

            <dl className="mt-4 divide-y divide-border/70 text-sm">
              <div className="flex items-center justify-between gap-6 py-3">
                <dt className="text-muted-foreground">Source of truth</dt>
                <dd className="flex items-center gap-2 font-mono text-xs text-foreground">
                  <Cloud className="h-3.5 w-3.5 text-muted-foreground" />
                  Cloudflare KV
                </dd>
              </div>
              <div className="flex items-center justify-between gap-6 py-3">
                <dt className="text-muted-foreground">Local cache</dt>
                <dd className="font-mono text-xs text-foreground">localStorage</dd>
              </div>
              <div className="flex items-center justify-between gap-6 py-3">
                <dt className="text-muted-foreground">Media library</dt>
                <dd className="font-mono text-xs text-foreground">IndexedDB (this device)</dd>
              </div>
              <div className="flex items-center justify-between gap-6 py-3">
                <dt className="text-muted-foreground">Records in this browser</dt>
                <dd className="font-mono text-xs text-foreground">
                  {counts.projects} projects · {counts.categories} categories · {counts.technologies} tech
                </dd>
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
                Admin credentials are verified server-side by the Worker (encrypted secrets) and never shipped in the
                public JavaScript bundle.
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