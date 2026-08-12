import { api } from "@/lib/api"
import type { ActivityLog } from "@/types"

export const activityService = {
  async list(params: { action?: string; cursor?: string; limit?: number }) {
    const { data } = await api.get<{ items: ActivityLog[]; nextCursor: string | null }>("/activity", { params })
    return data
  },
}
