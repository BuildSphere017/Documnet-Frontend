import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  hint?: string
  trend?: { value: number; label?: string }
  accent?: "primary" | "flame" | "emerald" | "violet"
  index?: number
}

const accents: Record<NonNullable<StatCardProps["accent"]>, { chip: string; glow: string }> = {
  primary: { chip: "bg-[hsl(204_92%_41%_/_0.10)] text-[hsl(204_92%_32%)]", glow: "from-primary/10" },
  flame:   { chip: "bg-[hsl(22_92%_52%_/_0.10)] text-[hsl(22_92%_42%)]", glow: "from-flame/10" },
  emerald: { chip: "bg-[hsl(160_84%_39%_/_0.10)] text-[hsl(160_84%_28%)]", glow: "from-emerald-500/10" },
  violet:  { chip: "bg-[hsl(258_90%_66%_/_0.10)] text-[hsl(258_70%_50%)]", glow: "from-violet-500/10" },
}

export function StatCard({ label, value, icon: Icon, hint, trend, accent = "primary", index = 0 }: StatCardProps) {
  const a = accents[accent]
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="kpi-card group relative overflow-hidden p-5">
        <div className="flex items-start justify-between">
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-110", a.chip)}>
            <Icon className="h-[22px] w-[22px]" strokeWidth={2.4} />
          </div>
          {trend && (
            <span className={cn(
              "rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums",
              trend.value >= 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive",
            )}>
              {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%{trend.label ? ` ${trend.label}` : ""}
            </span>
          )}
        </div>
        <div className="mt-5">
          <div className="font-display text-[2rem] font-bold leading-none tracking-tight tabular-nums text-foreground">{value}</div>
          <div className="mt-2 text-sm font-semibold text-foreground/80">{label}</div>
          {hint && <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>}
        </div>
      </div>
    </motion.div>
  )
}
