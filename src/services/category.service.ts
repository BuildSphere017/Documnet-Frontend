import { api } from "@/lib/api"
import type { Category } from "@/types"

export interface CreateCategoryPayload {
  name: string
  color?: string
  description?: string
}
export interface UpdateCategoryPayload {
  name?: string
  color?: string
  description?: string
  archived?: boolean
}

export const categoryService = {
  async list(): Promise<Category[]> {
    const { data } = await api.get<Category[]>("/categories")
    return data
  },
  async create(payload: CreateCategoryPayload): Promise<Category> {
    const { data } = await api.post<Category>("/categories", payload)
    return data
  },
  async update(id: string, payload: UpdateCategoryPayload): Promise<Category> {
    const { data } = await api.patch<Category>(`/categories/${id}`, payload)
    return data
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/categories/${id}`)
  },
}
