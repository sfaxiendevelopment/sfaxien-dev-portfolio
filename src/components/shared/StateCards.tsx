import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'

export function SetupState({ message }: { message: string }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-3 p-14 text-center">
        <p className="font-display text-lg text-foreground">Not connected yet</p>
        <p className="max-w-md font-mono text-xs leading-relaxed text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  )
}

export function EmptyState({
  icon,
  title,
  description,
}: {
  icon?: ReactNode
  title: string
  description: string
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-3 p-14 text-center">
        {icon && <div className="text-muted-foreground">{icon}</div>}
        <p className="font-display text-lg text-foreground">{title}</p>
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}