import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { aiService } from "@/services/ai.service"

export function useAiSearch() {
  return useMutation({
    mutationFn: (query: string) => aiService.search(query),
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "AI search failed"),
  })
}

export function useAiChat() {
  return useMutation({
    mutationFn: ({ question, documentId }: { question: string; documentId?: string }) =>
      aiService.chat(question, documentId),
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "AI chat failed"),
  })
}
