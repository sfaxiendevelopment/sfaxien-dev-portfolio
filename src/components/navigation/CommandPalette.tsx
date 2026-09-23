import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Home, FolderKanban, User, Wrench, Mail, Search, ArrowRight } from 'lucide-react'
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { COMMAND_ITEMS } from '@/components/navigation/links'

// NOTE: /admin-sec is intentionally not exposed through the palette.

const icons: Record<string, React.ReactNode> = {
  home: <Home className="h-4 w-4" />,
  projects: <FolderKanban className="h-4 w-4" />,
  about: <User className="h-4 w-4" />,
  services: <Wrench className="h-4 w-4" />,
  contact: <Mail className="h-4 w-4" />,
  search: <Search className="h-4 w-4" />,
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate()

  const groups = useMemo(() => {
    const map = new Map<string, typeof COMMAND_ITEMS>()
    for (const item of COMMAND_ITEMS) {
      const arr = map.get(item.group) ?? []
      arr.push(item)
      map.set(item.group, arr)
    }
    return Array.from(map.entries())
  }, [])

  const run = (path: string) => {
    onOpenChange(false)
    navigate(path)
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty className="py-8 text-sm">
          No results found.
          <span className="mt-1 block text-xs text-muted-foreground">Try “Projects” or an action like “Go Home”.</span>
        </CommandEmpty>
        {groups.map(([group, items]) => (
          <CommandGroup key={group} heading={group}>
            {items.map((item) => (
              <CommandItem key={item.id} onSelect={() => run(item.path)} keywords={item.keywords}>
                {icons[item.id]}
                <span>{item.label}</span>
                <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground/50" />
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  )
}