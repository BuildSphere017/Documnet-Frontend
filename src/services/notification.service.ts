import { api } from "@/lib/api"
import type { NotificationItem } from "@/types"

export const notificationService = {
  async list() {
    const { data } = await api.get<{ items: NotificationItem[]; unread: number }>("/notifications")
    return data
  },
  async markRead(id: string) { await api.post(`/notifications/${id}/read`) },
  async markAllRead() { await api.post("/notifications/read-all") },
}
