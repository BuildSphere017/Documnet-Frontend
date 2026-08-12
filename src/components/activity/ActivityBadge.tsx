import { cn } from "@/lib/utils"
import type { ActivityAction } from "@/types"

const styles: Record<ActivityAction, string> = {
  UPLOAD:    "bg-primary/10 text-primary",
  DOWNLOAD:  "bg-emerald-500/10 text-emerald-600",
  VIEW:      "bg-muted text-muted-foreground",
  LINK_VIEW: "bg-muted text-muted-foreground",
  SHARE:     "bg-flame/10 text-flame",
  DELETE:    "bg-destructive/10 text-destructive",
  LOGIN:     "bg-violet-500/10 text-violet-600",
  AI_SEARCH: "bg-blue-500/10 text-blue-600",
  EXPORT:    "bg-amber-500/10 text-amber-600",
}

export function ActivityBadge({ action }: { action: ActivityAction }) {
  return (
    <span className={cn(
      "rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide",
      styles[action],
    )}>
      {action.replace("_", " ")}
    </span>
  )
}
