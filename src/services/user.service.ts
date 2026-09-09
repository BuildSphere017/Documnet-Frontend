import { api } from "@/lib/api"
import type { User, Role } from "@/types"

export interface UserWithAccess extends User {
  permissions?: { categoryId: string; canView: boolean }[]
  _count?: { documents: number }
}

export interface CreateUserPayload {
  fullName: string
  username: string
  password: string
  email?: string
  role: Role
  department?: string
  departmentId?: string
  categoryIds: string[]
}

export interface UpdateUserPayload {
  fullName?: string
  email?: string
  role?: Role
  department?: string
  categoryIds?: string[]
}

// ---------------------------------------------------------
// CATEGORY ACCESS TYPES
// ---------------------------------------------------------

export interface CategoryAccessCategory {
  id: string
  name: string
  slug: string
  color: string
  icon?: string | null
  description?: string | null
  sortOrder: number
}

export interface CategoryAccessUser {
  id: string
  fullName: string
  username: string
  email?: string | null
  role: Role
  status: string
  categoryIds: string[]
}

export interface CategoryAccessResponse {
  users: CategoryAccessUser[]
  categories: CategoryAccessCategory[]
}

export interface UpdateCategoryAccessResponse {
  success: boolean
  userId: string
  fullName: string
  username: string
  role: Role
  categoryIds: string[]
}

export const userService = {
  // ---------------------------------------------------------
  // USERS
  // ---------------------------------------------------------

  async list(): Promise<UserWithAccess[]> {
    const { data } = await api.get<UserWithAccess[]>("/users")
    return data
  },

  async create(payload: CreateUserPayload): Promise<UserWithAccess> {
    const { data } = await api.post<UserWithAccess>("/users", payload)
    return data
  },

  async update(
    id: string,
    payload: UpdateUserPayload,
  ): Promise<UserWithAccess> {
    const { data } = await api.patch<UserWithAccess>(
      `/users/${id}`,
      payload,
    )

    return data
  },

  async disable(id: string) {
    await api.post(`/users/${id}/disable`)
  },

  async enable(id: string) {
    await api.post(`/users/${id}/enable`)
  },

  async resetPassword(id: string, password: string) {
    await api.post(`/users/${id}/reset-password`, { password })
  },

  async remove(id: string) {
    await api.delete(`/users/${id}`)
  },

  // ---------------------------------------------------------
  // CATEGORY ACCESS
  // ---------------------------------------------------------

  async getCategoryAccess(): Promise<CategoryAccessResponse> {
    const { data } = await api.get<CategoryAccessResponse>(
      "/users/category-access",
    )

    return data
  },

  async updateCategoryAccess(
    userId: string,
    categoryIds: string[],
  ): Promise<UpdateCategoryAccessResponse> {
    const { data } =
      await api.put<UpdateCategoryAccessResponse>(
        `/users/${userId}/category-access`,
        {
          categoryIds,
        },
      )

    return data
  },
}