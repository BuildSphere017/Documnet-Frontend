import logo from "@/assets/logo.png"
import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
  return <img src={logo} alt="MAKPHALT DMS" className={cn("h-9 w-auto object-contain", className)} />
}

/** Text wordmark — works on any background incl. dark mode / collapsed rails. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("text-xl font-extrabold tracking-tight", className)}>
      <span className="text-primary">MAK</span>
      <span className="text-flame">PHALT</span>
      <span className="ml-1.5 align-super text-[10px] font-bold text-muted-foreground">DMS</span>
    </span>
  )
}
