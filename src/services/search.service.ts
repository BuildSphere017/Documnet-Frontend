import { api } from "@/lib/api"

export interface RecentSearch { id: string; query: string; mode: string; results: number; createdAt: string }

export const searchHistoryService = {
  async recent(): Promise<RecentSearch[]> {
    const { data } = await api.get("/documents/searches/recent")
    return data
  },
  async clear(): Promise<void> {
    await api.delete("/documents/searches/clear")
  },
}
