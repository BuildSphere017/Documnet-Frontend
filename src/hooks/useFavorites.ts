import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { favoriteService } from "@/services/favorite.service"
import { toast } from "sonner"

export function useFavorites() {
  return useQuery({ queryKey: ["favorites"], queryFn: favoriteService.list })
}

export function useToggleFavorite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => favoriteService.toggle(id),
    onSuccess: (data, _id) => {
      qc.invalidateQueries({ queryKey: ["favorites"] })
      qc.invalidateQueries({ queryKey: ["documents"] })
      toast.success(data.favorited ? "Added to favorites" : "Removed from favorites")
    },
    onError: () => toast.error("Failed to update favorite"),
  })
}
