import { api } from "@/lib/api"

export interface Profile {
  id: string; fullName: string; username: string; email?: string | null
  role: string; department?: string | null; createdAt?: string; lastLoginAt?: string | null
}
export interface SystemInfo {
  aiProvider: string; storageBucket: string; storageConfigured: boolean; maxFileSizeMb: number
}

export const settingsService = {
  async profile(): Promise<Profile> { return (await api.get<Profile>("/settings/profile")).data },
  async updateProfile(data: { fullName?: string; email?: string; department?: string }): Promise<Profile> {
    return (await api.patch<Profile>("/settings/profile", data)).data
  },
  async changePassword(currentPassword: string, newPassword: string) {
    await api.post("/settings/change-password", { currentPassword, newPassword })
  },
  async system(): Promise<SystemInfo> { return (await api.get<SystemInfo>("/settings/system")).data },
}
