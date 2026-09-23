import { Toaster as Sonner } from 'sonner'
import { usePrefersReducedMotion } from '@/hooks/use-media'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const reduced = usePrefersReducedMotion()

  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            'group toast border border-border bg-popover text-popover-foreground shadow-xl rounded-lg',
          description: 'text-muted-foreground',
          actionButton: 'bg-primary text-primary-foreground',
          cancelButton: 'bg-muted text-muted-foreground',
        },
      }}
      duration={reduced ? 8000 : 5000}
      offset={16}
      {...props}
    />
  )
}

export { Toaster }