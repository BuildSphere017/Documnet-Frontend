import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Segment<T extends string> {
  value: T
  label: string
  icon?: LucideIcon
}

interface SegmentedControlProps<T extends string> {
  value: T
  onChange: (value: T) => void
  segments: Segment<T>[]
  layoutId?: string
  className?: string
}

/** An animated pill-style segmented control (e.g. Manual | AI). */
export function SegmentedControl<T extends string>({
  value, onChange, segments, layoutId = "segmented", className,
}: SegmentedControlProps<T>) {
  return (
    <div className={cn("inline-flex items-center gap-1 rounded-xl border border-border bg-muted/50 p-1", className)}>
      {segments.map((seg) => {
        const active = seg.value === value
        return (
          <button
            key={seg.value}
            onClick={() => onChange(seg.value)}
            className={cn(
              "relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-lg bg-card shadow-sm ring-1 ring-border/60"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            {seg.icon && <seg.icon className={cn("relative z-10 h-3.5 w-3.5", active && seg.value === "ai" && "text-flame")} />}
            <span className="relative z-10">{seg.label}</span>
          </button>
        )
      })}
    </div>
  )
}
