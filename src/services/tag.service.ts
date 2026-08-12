import { api } from "@/lib/api"

export interface Tag { id: string; name: string; count: number }

export const tagService = {
  async listAll(): Promise<Tag[]> {
    const { data } = await api.get("/documents/tags/list")
    return data
  },
  async setForDocument(id: string, tags: string[]): Promise<string[]> {
    const { data } = await api.put(`/documents/${id}/tags`, { tags })
    return data
  },
}
