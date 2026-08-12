import { api } from "@/lib/api"
import type { DocumentItem, Paginated } from "@/types"

export interface ListDocumentsParams {
  q?: string
  categoryId?: string
  page?: number
  pageSize?: number
}

export interface UploadDocumentPayload {
  title: string
  keyword?: string
  categoryId?: string
  description?: string
  file: File
}

export interface ShareResult {
  token: string
  url: string
  expiresAt: string | null
  passwordProtected: boolean
}

export interface DocumentUrlResult {
  url: string
  fileName: string
}

export const documentService = {
  // ─────────────────────────────────────────────
  // LIST DOCUMENTS
  // ─────────────────────────────────────────────
  async list(
    params: ListDocumentsParams
  ): Promise<Paginated<DocumentItem>> {
    const { data } = await api.get<Paginated<DocumentItem>>(
      "/documents",
      { params }
    )

    return data
  },

  // ─────────────────────────────────────────────
  // UPLOAD DOCUMENT
  // ─────────────────────────────────────────────
  async upload(
    payload: UploadDocumentPayload,
    onProgress?: (pct: number) => void
  ): Promise<DocumentItem> {
    const form = new FormData()

    form.append("title", payload.title)

    if (payload.keyword) {
      form.append("keyword", payload.keyword)
    }

    if (payload.categoryId) {
      form.append("categoryId", payload.categoryId)
    }

    if (payload.description) {
      form.append("description", payload.description)
    }

    form.append("file", payload.file)

    const { data } = await api.post<DocumentItem>(
      "/documents",
      form,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },

        onUploadProgress: (e) => {
          if (onProgress && e.total) {
            onProgress(
              Math.round(
                (e.loaded / e.total) * 100
              )
            )
          }
        },
      }
    )

    return data
  },

  // ─────────────────────────────────────────────
  // GET DOCUMENT URL
  //
  // download = false
  // → Preview URL
  //
  // download = true
  // → Download URL
  // ─────────────────────────────────────────────
  async getDownloadUrl(
    id: string,
    download = false
  ): Promise<DocumentUrlResult> {
    const { data } = await api.get<DocumentUrlResult>(
      `/documents/${id}/download`,
      {
        params: download
          ? { download: "true" }
          : undefined,
      }
    )

    return data
  },

  // ─────────────────────────────────────────────
  // PREVIEW DOCUMENT
  // ─────────────────────────────────────────────
  async getPreviewUrl(
    id: string
  ): Promise<DocumentUrlResult> {
    return this.getDownloadUrl(id, false)
  },

  // ─────────────────────────────────────────────
  // DOWNLOAD DOCUMENT
  // ─────────────────────────────────────────────
  async getDirectDownloadUrl(
    id: string
  ): Promise<DocumentUrlResult> {
    return this.getDownloadUrl(id, true)
  },

  // ─────────────────────────────────────────────
  // DELETE DOCUMENT
  // ─────────────────────────────────────────────
  async remove(id: string): Promise<void> {
    await api.delete(`/documents/${id}`)
  },

  // ─────────────────────────────────────────────
  // REPROCESS DOCUMENT
  // ─────────────────────────────────────────────
  async reprocess(id: string): Promise<void> {
    await api.post(`/documents/${id}/reprocess`)
  },

  // ─────────────────────────────────────────────
  // BULK UPLOAD
  // ─────────────────────────────────────────────
  async bulkUpload(
    files: File[],
    categoryId: string | undefined,
    onProgress?: (pct: number) => void
  ): Promise<{
    total: number
    results: {
      fileName: string
      status: string
      title?: string
    }[]
  }> {
    const form = new FormData()

    if (categoryId) {
      form.append("categoryId", categoryId)
    }

    files.forEach((file) => {
      form.append("files", file)
    })

    const { data } = await api.post(
      "/documents/bulk",
      form,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },

        onUploadProgress: (e) => {
          if (onProgress && e.total) {
            onProgress(
              Math.round(
                (e.loaded / e.total) * 100
              )
            )
          }
        },
      }
    )

    return data
  },

  // ─────────────────────────────────────────────
  // CREATE SHARE LINK
  // ─────────────────────────────────────────────
  async share(
    id: string,
    payload: {
      password?: string
      expiresInHours?: number
      maxViews?: number
    }
  ): Promise<ShareResult> {
    const { data } =
      await api.post<ShareResult>(
        `/documents/${id}/share`,
        payload
      )

    return data
  },
}