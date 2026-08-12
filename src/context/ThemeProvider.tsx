import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type Theme = "light" | "dark" | "system"
interface ThemeContextValue { theme: Theme; setTheme: (t: Theme) => void; resolved: "light" | "dark" }

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)
const KEY = "dms.theme"

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => (localStorage.getItem(KEY) as Theme) || "light")
  const [resolved, setResolved] = useState<"light" | "dark">("light")

  useEffect(() => {
    const root = document.documentElement
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const apply = () => {
      const isDark = theme === "dark" || (theme === "system" && mq.matches)
      root.classList.toggle("dark", isDark)
      setResolved(isDark ? "dark" : "light")
    }
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [theme])

  const setTheme = (t: Theme) => { localStorage.setItem(KEY, t); setThemeState(t) }

  return <ThemeContext.Provider value={{ theme, setTheme, resolved }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
  return ctx
}
