import { api } from "@/lib/api"

export interface AnalyticsOverview {
  totals: {
    documents: number; users: number; categories: number; storageUsed: number
    downloads30d: number; aiSearches30d: number; shares30d: number
  }
  mostViewed: { id: string; title: string; count: number; category?: string }[]
  mostDownloaded: { id: string; title: string; count: number; category?: string }[]
  categoryUsage: { name: string; value: number; color: string }[]
  activityTrend: { date: string; uploads: number; downloads: number; ai: number }[]
  inactive: { id: string; title: string; category?: string; createdAt: string }[]
  topContributors: { name: string; value: number }[]
}

export const analyticsService = {
  async overview(): Promise<AnalyticsOverview> {
    const { data } = await api.get<AnalyticsOverview>("/analytics/overview")
    return data
  },
}
