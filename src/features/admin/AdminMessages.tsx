import { useMemo, useState } from 'react'
import { Mail, MailOpen, Archive, Trash2, Inbox, CheckCheck, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { useAdminMessages, useUpdateMessageStatus, useDeleteMessage, useMarkAllMessagesRead } from '@/hooks/use-admin'
import type { ContactMessageRow } from '@/types'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { EmptyState } from '@/components/shared/StateCards'

function statusBadge(status: ContactMessageRow['status']) {
  if (status === 'new') return <Badge variant="accent">New</Badge>
  if (status === 'archived') return <Badge variant="outline">Archived</Badge>
  return <Badge variant="secondary">Read</Badge>
}

export default function AdminMessages() {
  const { data, isLoading } = useAdminMessages()
  const updateStatus = useUpdateMessageStatus()
  const deleteMessage = useDeleteMessage()
  const markAllRead = useMarkAllMessagesRead()
  const [viewing, setViewing] = useState<ContactMessageRow | null>(null)
  const [deleting, setDeleting] = useState<ContactMessageRow | null>(null)

  const messages = useMemo(() => (data?.data ?? []).slice(0, 200), [data])
  const stats = useMemo(() => {
    const total = messages.length
    const unread = messages.filter((m) => m.status === 'new').length
    const read = messages.filter((m) => m.status === 'read').length
    const archived = messages.filter((m) => m.status === 'archived').length
    return { total, unread, read, archived }
  }, [messages])

  async function setStatus(id: string, status: 'read' | 'archived') {
    try {
      const res = await updateStatus.mutateAsync({ id, status })
      if (res.error) throw new Error(res.error)
      toast.success(status === 'read' ? 'Marked as read.' : 'Message archived.')
    } catch {
      toast.error('Could not update the message.')
    }
  }

  async function handleDelete() {
    if (!deleting) return
    try {
      const res = await deleteMessage.mutateAsync(deleting.id)
      if (res.error) throw new Error(res.error)
      toast.success('Message deleted.')
      setDeleting(null)
    } catch {
      toast.error('Could not delete the message.')
    }
  }

  async function handleMarkAllRead() {
    try {
      const res = await markAllRead.mutateAsync()
      if (res.error) throw new Error(res.error)
      toast.success('All messages marked as read.')
    } catch {
      toast.error('Could not mark all messages as read.')
    }
  }

  const statCards = [
    { label: 'Total', value: stats.total, icon: MessageSquare },
    { label: 'Unread', value: stats.unread, icon: MailOpen },
    { label: 'Read', value: stats.read, icon: CheckCheck },
    { label: 'Archived', value: stats.archived, icon: Archive },
  ]

  return (
    <div>
      <AdminPageHeader
        title="Messages"
        description="Contact form submissions from the portfolio."
        action={
          <Button variant="outline" onClick={handleMarkAllRead} disabled={stats.unread === 0 || markAllRead.isPending}>
            <CheckCheck className="mr-1.5 h-4 w-4" /> Mark all read
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary/50 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
                  <p className="font-display text-xl font-semibold text-foreground">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <EmptyState
            icon={<Inbox className="h-8 w-8" />}
            title="No messages yet"
            description="Contact form submissions will show up here."
          />
        ) : (
          <ul className="space-y-3">
            {messages.map((m) => (
              <li
                key={m.id}
                className={`rounded-xl border border-border/70 p-4 transition-colors ${
                  m.status === 'new' ? 'bg-primary/[0.04]' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-secondary/40 text-muted-foreground">
                    {m.status === 'new' ? <Mail className="h-4 w-4 text-primary" /> : <MailOpen className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium text-foreground">{m.name}</p>
                      <a href={`mailto:${m.email}`} className="truncate font-mono text-xs text-primary hover:underline">
                        {m.email}
                      </a>
                      {statusBadge(m.status)}
                      <span className="ml-auto shrink-0 font-mono text-[11px] text-muted-foreground">
                        {formatDate(m.created_at)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {m.project_type || '—'}{m.budget ? ` · ${m.budget}` : ''}
                    </p>
                    <p className="mt-2 truncate text-sm text-foreground/80">{m.message}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setViewing(m)}>
                        <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> View
                      </Button>
                      {m.status === 'new' && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setStatus(m.id, 'read')}>
                          <CheckCheck className="mr-1.5 h-3.5 w-3.5" /> Mark read
                        </Button>
                      )}
                      {m.status !== 'archived' && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setStatus(m.id, 'archived')}>
                          <Archive className="mr-1.5 h-3.5 w-3.5" /> Archive
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-destructive hover:text-destructive"
                        onClick={() => setDeleting(m)}
                      >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={viewing !== null} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewing?.name}</DialogTitle>
            <DialogDescription>
              {viewing ? `${viewing.email} · ${formatDate(viewing.created_at)}` : 'Message'}
            </DialogDescription>
          </DialogHeader>
          {viewing && (
            <div className="space-y-4 whitespace-pre-line text-sm leading-relaxed text-foreground">
              <p className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-full border border-border px-2 py-0.5">{viewing.project_type || 'General'}</span>
                {viewing.budget && <span className="rounded-full border border-border px-2 py-0.5">{viewing.budget}</span>}
              </p>
              <p>{viewing.message}</p>
              <div className="flex gap-2">
                <Button size="sm" asChild>
                  <a href={`mailto:${viewing.email}?subject=Re: ${viewing.project_type || 'your inquiry'}`}>Reply by email</a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this message?</AlertDialogTitle>
            <AlertDialogDescription>
              The message from “{deleting?.name}” is permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}