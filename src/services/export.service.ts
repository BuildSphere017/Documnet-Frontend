
import { api } from "@/lib/api"

export const exportService = {
  async getActivity(): Promise<any[]> {
    const { data } = await api.get("/documents/export/activity")
    return data
  },

  async getDocuments(): Promise<any[]> {
    const { data } = await api.get("/documents/export/documents")
    return data
  },

  async downloadDocumentInventory(): Promise<Blob> {
    const { data } = await api.get("/documents/export/inventory", {
      responseType: "blob",
    })

    return data as Blob
  },
}
