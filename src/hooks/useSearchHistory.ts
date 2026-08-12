import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { searchHistoryService } from "@/services/search.service"
import { toast } from "sonner"

export function useRecentSearches() {
  return useQuery({ queryKey: ["recent-searches"], queryFn: searchHistoryService.recent, staleTime: 10_000 })
}

export function useClearSearches() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: searchHistoryService.clear,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["recent-searches"] }); toast.success("Search history cleared") },
  })
}
