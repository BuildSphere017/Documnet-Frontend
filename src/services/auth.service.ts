import { api } from "@/lib/api"
import type { AuthResponse, User } from "@/types"

export const authService = {
  async login(username: string, password: string) {
    const { data } = await api.post<AuthResponse>("/auth/login", { username, password })
    return data
  },
  async me() {
    const { data } = await api.get<User>("/auth/me")
    return data
  },
  async logout() {
    await api.post("/auth/logout").catch(() => {})
  },
}
