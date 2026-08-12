import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { toast } from "sonner"

export function useTogglePin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => { const { data } = await api.post(`/documents/${id}/pin`); return data },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["documents"] })
      toast.success(data.isPinned ? "📌 Document pinned to top" : "Unpinned document")
    },
    onError: () => toast.error("Failed to update pin"),
  })
}
