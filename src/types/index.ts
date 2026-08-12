export type Role = "ADMIN" | "MANAGER" | "SALES"

export interface User {
  id: string
  fullName: string
  username: string
  email?: string | null
  role: Role
  department?: string | null
  status: "ACTIVE" | "DISABLED"
  avatarUrl?: string | null
  storageUsed?: number
  lastLoginAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  slug: string
  color?: string | null
  icon?: string | null
  archived: boolean
  documentCount?: number
  createdAt: string
  updatedAt: string
}

export type DocumentStatus = "PROCESSING" | "READY" | "FAILED"
export type FileKind = "PDF" | "DOCX" | "PPT" | "XLSX" | "IMAGE" | "VIDEO" | "ZIP" | "OTHER"

export interface DocumentItem {
  id: string
  title: string
  description?: string | null
  keyword?: string | null
  fileName: string
  mimeType: string
  fileType: FileKind
  size: number
  thumbnailUrl?: string | null
  categoryId?: string | null
  category?: Category | null
  version: number
  status: DocumentStatus
  summary?: string | null
  tags?: string[]
  isPinned?: boolean
  isFavorite?: boolean
  downloadCount?: number
  viewCount?: number
  uploadedById: string
  uploadedBy?: Pick<User, "id" | "fullName">
  createdAt: string
  updatedAt: string
}

export type ActivityAction =
  | "UPLOAD" | "DOWNLOAD" | "VIEW" | "SHARE" | "DELETE"
  | "LOGIN" | "AI_SEARCH" | "LINK_VIEW" | "EXPORT"

export interface ActivityLog {
  id: string
  action: ActivityAction
  actorName: string
  targetTitle?: string | null
  meta?: Record<string, unknown>
  createdAt: string
}

export interface NotificationItem {
  id: string
  title: string
  body?: string | null
  type: string
  read: boolean
  link?: string | null
  createdAt: string
}

export interface DashboardOverview {
  stats: {
    storageUsed: number
    storageLimit: number
    totalDocuments: number
    totalCategories: number
    totalUsers: number
    uploadsToday: number
    downloadsToday: number
    aiSearchesToday: number
  }
  categoryDistribution: { name: string; value: number; color: string }[]
  storageTrend: { date: string; bytes: number }[]
  recentUploads: DocumentItem[]
  mostViewed: DocumentItem[]
  mostDownloaded: DocumentItem[]
  recentActivity: ActivityLog[]
}

export interface AuthResponse {
  accessToken: string
  user: User
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}
