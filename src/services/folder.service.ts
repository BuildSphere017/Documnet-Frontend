import { api } from "@/lib/api"
import type { Folder } from "@/types"

export interface CreateFolderPayload {
  name: string
  parentId?: string | null
}

export interface UpdateFolderPayload {
  name: string
}

export const folderService = {
  async list(parentId?: string | null): Promise<Folder[]> {
    const params = parentId ? { parentId } : {}

    const { data } = await api.get<Folder[]>("/folders", {
      params,
    })

    return data
  },

  async getById(id: string): Promise<Folder> {
    const { data } = await api.get<Folder>(`/folders/${id}`)
    return data
  },

  async create(payload: CreateFolderPayload): Promise<Folder> {
    const { data } = await api.post<Folder>("/folders", payload)
    return data
  },

  async rename(
    id: string,
    payload: UpdateFolderPayload
  ): Promise<Folder> {
    const { data } = await api.patch<Folder>(
      `/folders/${id}`,
      payload
    )

    return data
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/folders/${id}`)
  },

  async move(
    id: string,
    parentId: string | null
  ): Promise<Folder> {
    const { data } = await api.patch<Folder>(
      `/folders/${id}/move`,
      { parentId }
    )

    return data
  },

  // =========================================================
  // MOVE DOCUMENT
  // =========================================================

  async moveDocument(
    documentId: string,
    folderId: string | null
  ) {
    const { data } = await api.patch(
      `/folders/documents/${documentId}/move`,
      {
        folderId,
      }
    )

    return data
  },
}