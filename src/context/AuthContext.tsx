import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { authService } from "@/services/auth.service"
import { TOKEN_KEY } from "@/lib/api"
import type { Role, User } from "@/types"

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  hasRole: (...roles: Role[]) => boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) { setIsLoading(false); return }
    authService.me()
      .then(setUser)
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setIsLoading(false))
  }, [])

  const login = async (username: string, password: string) => {
    const { accessToken, user } = await authService.login(username, password)
    localStorage.setItem(TOKEN_KEY, accessToken)
    setUser(user)
  }

  const logout = async () => {
    await authService.logout()
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }

  const hasRole = (...roles: Role[]) => (user ? roles.includes(user.role) : false)

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
