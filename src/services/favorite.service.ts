import { api } from "@/lib/api"

export const favoriteService = {
  async toggle(id: string): Promise<{ favorited: boolean }> {
    const { data } = await api.post(`/documents/${id}/favorite`)
    return data
  },
  async list(): Promise<any[]> {
    const { data } = await api.get("/documents/favorites/list")
    return data
  },
}
