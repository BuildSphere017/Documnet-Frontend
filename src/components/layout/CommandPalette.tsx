import { useNavigate } from "react-router-dom"
import { Upload, Search as SearchIcon, Sparkles } from "lucide-react"
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command"
import { navItems } from "@/config/nav"
import { useAuth } from "@/context/AuthContext"

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const navigate = useNavigate()
  const { user, hasRole } = useAuth()
  const go = (to: string) => { onOpenChange(false); navigate(to) }

  const isAdmin = hasRole("ADMIN")
  // Sales users: only "Ask AI" + "Search documents", and no Navigate section.
  const items = navItems.filter((i) => !i.roles || (user && i.roles.includes(user.role)))

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Quick actions">
          {isAdmin && (
            <CommandItem onSelect={() => go("/documents")}>
              <Upload className="mr-2 h-4 w-4" /> Upload document
            </CommandItem>
          )}
          <CommandItem onSelect={() => go("/ai-search")}>
            <Sparkles className="mr-2 h-4 w-4" /> Ask AI
          </CommandItem>
          <CommandItem onSelect={() => go("/documents")}>
            <SearchIcon className="mr-2 h-4 w-4" /> Search documents
          </CommandItem>
        </CommandGroup>

        {isAdmin && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Navigate">
              {items.map((i) => (
                <CommandItem key={i.to} onSelect={() => go(i.to)}>
                  <i.icon className="mr-2 h-4 w-4" /> {i.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}
