import { api } from "@/lib/api"

export interface AiSearchResult {
  documentId: string
  title: string
  fileName: string
  fileType: string
  matchedParagraph: string
  confidence: number
  matchType?: string
}
export interface AiSearchResponse {
  query: string
  results: AiSearchResult[]
}
export interface AiCitation {
  ref: number
  documentId: string
  title: string
  page: number | null
  snippet: string
}
export interface AiChatResponse {
  answer: string
  citations: AiCitation[]
}

export const aiService = {
  async search(query: string): Promise<AiSearchResponse> {
    const { data } = await api.post<AiSearchResponse>("/ai/search", { query })
    return data
  },
  async chat(question: string, documentId?: string): Promise<AiChatResponse> {
    const { data } = await api.post<AiChatResponse>("/ai/chat", { question, documentId })
    return data
  },
}
