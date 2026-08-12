import { Moon, Sun } from "lucide-react"
import { motion } from "framer-motion"
import { useTheme } from "@/context/ThemeProvider"
import { cn } from "@/lib/utils"

/** A premium segmented sun/moon pill that slides between light and dark. */
export function ThemeToggle() {
  const { resolved, setTheme } = useTheme()
  const isDark = resolved === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="focus-ring relative flex h-9 w-[4.25rem] items-center rounded-full border border-border bg-muted/60 p-1 transition-colors hover:bg-muted"
    >
      {/* sliding knob */}
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 34 }}
        className={cn(
          "absolute z-10 flex h-7 w-7 items-center justify-center rounded-full shadow-sm",
          isDark ? "left-[calc(100%-1.9rem)] bg-primary text-primary-foreground" : "left-1 bg-white text-flame",
        )}
      >
        <motion.span key={isDark ? "moon" : "sun"}
          initial={{ rotate: -30, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}>
          {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </motion.span>
      </motion.span>
      {/* faint track icons */}
      <span className="flex w-full items-center justify-between px-1.5 text-muted-foreground/50">
        <Sun className="h-3.5 w-3.5" />
        <Moon className="h-3.5 w-3.5" />
      </span>
    </button>
  )
}
