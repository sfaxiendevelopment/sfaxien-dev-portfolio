import { Link } from 'react-router-dom'
import { FolderKanban, CheckCircle2, Edit3, Star, Mail, ArrowRight, Inbox } from 'lucide-react'
import { useAdminCounts, useAdminMessages } from '@/hooks/use-admin'
import { useAdminSession } from '@/providers/AdminProvider'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'

export default function AdminOverview() {
  const counts = useAdminCounts()
  const messages = useAdminMessages()
  const session = useAdminSession()

  const stats = [
    { label: 'Total projects', value: counts.data?.total, icon: FolderKanban },
    { label: 'Published', value: counts.data?.published, icon: CheckCircle2 },
    { label: 'Drafts', value: counts.data?.drafts, icon: Edit3 },
    { label: 'Featured', value: counts.data?.featured, icon: Star },
    { label: 'Unread messages', value: counts.data?.unread, icon: Mail },
  ]

  const recent = (messages.data?.data ?? []).slice(0, 5)

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description={`Welcome back${session?.username ? `, ${session.username}` : ''}. Here's the state of the site.`}
        action={
          <Button asChild>
            <Link to="/admin-sec/projects/new">
              <span className="mr-1">+</span> New project
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary/50 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
                  {counts.isLoading ? (
                    <Skeleton className="mt-1 h-6 w-10" />
                  ) : (
                    <p className="font-display text-xl font-semibold text-foreground">{s.value ?? 0}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Recent messages</CardTitle>
              <CardDescription>The latest contact form submissions.</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1">
              <Link to="/admin-sec/messages">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {messages.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 rounded-lg" />
                ))}
              </div>
            ) : recent.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <Inbox className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No messages yet.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border/70">
                {recent.map((m) => (
                  <li key={m.id} className="flex items-center gap-4 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-foreground">{m.name}</p>
                        {m.status === 'new' && <Badge variant="accent">New</Badge>}
                      </div>
                      <p className="truncate text-xs text-muted-foreground">{m.project_type}</p>
                    </div>
                    <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                      {formatDate(m.created_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Common tasks to keep the portfolio fresh.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { to: '/admin-sec/projects', label: 'Review & publish projects', desc: 'Toggle publish status from the list.' },
              { to: '/admin-sec/projects/new', label: 'Add a new project', desc: 'Create a full case study from scratch.' },
              { to: '/admin-sec/media', label: 'Upload media', desc: 'Add images and videos to your library.' },
              { to: '/admin-sec/messages', label: 'Check messages', desc: 'Read and reply to new inquiries.' },
              { to: '/admin-sec/categories', label: 'Manage categories', desc: 'Keep project taxonomy tidy.' },
            ].map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="group flex items-center justify-between gap-4 rounded-lg border border-border/60 px-4 py-3 transition-colors hover:border-primary/50"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{a.label}</p>
                  <p className="text-xs text-muted-foreground">{a.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}