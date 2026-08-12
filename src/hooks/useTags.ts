import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { tagService } from "@/services/tag.service"
import { toast } from "sonner"

export function useTags() {
  return useQuery({ queryKey: ["tags"], queryFn: tagService.listAll })
}

export function useSetTags() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, tags }: { id: string; tags: string[] }) => tagService.setForDocument(id, tags),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents"] })
      qc.invalidateQueries({ queryKey: ["tags"] })
      toast.success("Tags updated")
    },
    onError: () => toast.error("Failed to update tags"),
  })
}
