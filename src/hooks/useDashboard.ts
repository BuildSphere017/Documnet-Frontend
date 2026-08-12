import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { dashboardService } from "@/services/dashboard.service"

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: dashboardService.overview,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,  // show old data while refetching — no spinner
  })
}