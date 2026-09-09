import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Sparkles,
  Loader2,
  FileText,
  ArrowRight,
  Search as SearchIcon,
  Send,
  Download,
  Eye,
  Clock,
} from "lucide-react"

import { PageHeader } from "@/components/common/PageHeader"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"

import {
  useAiSearch,
  useAiChat,
} from "@/hooks/useAiSearch"

import {
  downloadDocument,
} from "@/hooks/useDocuments"

import { PreviewModal } from "@/components/common/PreviewModal"

import { cn } from "@/lib/utils"

import type {
  AiCitation,
  AiSearchResult,
} from "@/services/ai.service"

import {
  useRecentSearches,
  useClearSearches,
} from "@/hooks/useSearchHistory"

import type { RecentSearch } from "@/services/search.service"

const EXAMPLES = [
  "Show waterproofing documents",
  "Find the XLPE datasheet",
  "What's the warranty period?",
  "Compare S1 and S2 grades",
]

interface ChatTurn {
  role: "user" | "assistant"
  content: string
  citations?: AiCitation[]
  results?: AiSearchResult[]
}

interface PreviewDocument {
  id: string
  title: string
  fileType: string
}

export default function AISearchPage() {
  return (
    <>
      <PageHeader
        title="AI Search"
        subtitle="Find documents by meaning, or ask the assistant to fetch them for you."
      />

      <Tabs defaultValue="search">
        <TabsList>
          <TabsTrigger value="search">
            <SearchIcon className="h-4 w-4" />
            Semantic search
          </TabsTrigger>

          <TabsTrigger value="chat">
            <Sparkles className="h-4 w-4" />
            Ask AI
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search">
          <SemanticSearch />
        </TabsContent>

        <TabsContent value="chat">
          <ChatPanel />
        </TabsContent>
      </Tabs>
    </>
  )
}

/* =========================================================
   SEMANTIC SEARCH
========================================================= */

function SemanticSearch() {
  const [query, setQuery] = useState("")

  const [previewFor, setPreviewFor] =
    useState<PreviewDocument | null>(null)

  const search = useAiSearch()

  const run = (q?: string) => {
    const value = (q ?? query).trim()

    if (!value) {
      return
    }

    setQuery(value)

    search.mutate(value)
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Sparkles className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-flame" />

          <Input
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            onKeyDown={(e) =>
              e.key === "Enter" && run()
            }
            placeholder="Ask in plain language…"
            className="h-11 pl-9"
          />
        </div>

        <Button
          variant="flame"
          size="lg"
          onClick={() => run()}
          disabled={search.isPending}
        >
          {search.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}

          Search
        </Button>
      </div>

      {!search.data &&
        !search.isPending && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => run(ex)}
                  className="rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-flame/40 hover:text-foreground"
                >
                  {ex}
                </button>
              ))}
            </div>

            <RecentSearches onSelect={run} />
          </div>
        )}

      {search.isPending && (
        <div className="space-y-3">
          {Array.from({
            length: 3,
          }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-28 rounded-2xl"
            />
          ))}
        </div>
      )}

      {search.data &&
        (search.data.results.length ===
        0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            No documents matched. Try
            different wording.
          </Card>
        ) : (
          <div className="space-y-3">
            {search.data.results.map(
              (r, i) => (
                <motion.div
                  key={r.documentId}
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: i * 0.04,
                  }}
                >
                  <Card className="p-4 transition-shadow hover:shadow-card">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0 text-primary" />

                        <div className="min-w-0">
                          <p className="truncate font-semibold">
                            {r.title}
                          </p>

                          <p className="truncate text-xs text-muted-foreground">
                            {r.fileName}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        {r.matchType ===
                          "keyword" && (
                          <Badge variant="flame">
                            Keyword
                          </Badge>
                        )}

                        <Badge
                          variant="success"
                          className="tabular-nums"
                        >
                          {Math.round(
                            r.confidence * 100
                          )}
                          %
                        </Badge>
                      </div>
                    </div>

                    {r.matchedParagraph && (
                      <p className="mt-2 line-clamp-3 rounded-lg bg-muted/50 p-2 text-sm text-muted-foreground">
                        …{r.matchedParagraph}…
                      </p>
                    )}

                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setPreviewFor({
                            id: r.documentId,
                            title: r.title,
                            fileType: r.fileType,
                          })
                        }
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Preview
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          downloadDocument(
                            r.documentId
                          )
                        }
                      >
                        Download
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )
            )}
          </div>
        ))}

      {/* =====================================================
          AI SEARCH PREVIEW MODAL
      ===================================================== */}

      <PreviewModal
        docId={previewFor?.id ?? null}
        docTitle={previewFor?.title}
        fileType={previewFor?.fileType}
        onClose={() => setPreviewFor(null)}
        onDownload={
          previewFor
            ? () => {
                downloadDocument(
                  previewFor.id
                )

                setPreviewFor(null)
              }
            : undefined
        }
      />
    </div>
  )
}

/* =========================================================
   CHAT
========================================================= */

function ChatPanel() {
  const [input, setInput] = useState("")

  const [turns, setTurns] =
    useState<ChatTurn[]>([])

  const [previewFor, setPreviewFor] =
    useState<PreviewDocument | null>(null)

  const chat = useAiChat()

  const endRef =
    useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: "smooth",
    })
  }, [turns, chat.isPending])

  const send = () => {
    const q = input.trim()

    if (!q || chat.isPending) {
      return
    }

    setTurns((t) => [
      ...t,
      {
        role: "user",
        content: q,
      },
    ])

    setInput("")

    chat.mutate(
      {
        question: q,
      },
      {
        onSuccess: (res) => {
          setTurns((t) => [
            ...t,
            {
              role: "assistant",
              content: res.answer,
              citations:
                res.citations,
              results:
                res.results ?? [],
            },
          ])
        },

        onError: () => {
          setTurns((t) => [
            ...t,
            {
              role: "assistant",
              content:
                "Sorry — I couldn't reach the AI just now. Please try again in a moment.",
            },
          ])
        },
      }
    )
  }

  return (
    <Card className="flex h-[34rem] flex-col overflow-hidden">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {turns.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-flame/10 text-flame">
              <Sparkles className="h-6 w-6" />
            </div>

            <p className="font-medium">
              Ask for any document
            </p>

            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              e.g. “give me the test report
              of MAK Premix”. I'll find it,
              summarise it, and attach a
              link.
            </p>
          </div>
        )}

        {turns.map((t, i) => (
          <div
            key={i}
            className={cn(
              "flex",
              t.role === "user"
                ? "justify-end"
                : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[90%] rounded-2xl px-4 py-2.5 text-sm",
                t.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              <p className="whitespace-pre-wrap">
                {t.content}
              </p>

              {/* =================================================
                  AI DOCUMENT RESULTS
              ================================================= */}

              {t.results &&
                t.results.length > 0 && (
                  <div className="mt-3 space-y-2 border-t border-border/50 pt-2.5">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Matching Documents
                    </p>

                    {t.results.map(
                      (r) => (
                        <div
                          key={r.documentId}
                          className="rounded-lg bg-background/60 p-2.5"
                        >
                          <div className="flex items-start gap-2">
                            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-semibold">
                                {r.title}
                              </p>

                              <p className="truncate text-[10px] text-muted-foreground">
                                {r.fileName}
                              </p>
                            </div>

                            {r.matchType ===
                              "keyword" && (
                              <Badge
                                variant="flame"
                                className="shrink-0 text-[9px]"
                              >
                                Keyword
                              </Badge>
                            )}
                          </div>

                          {r.matchedParagraph && (
                            <p className="mt-2 line-clamp-3 rounded-md bg-muted/50 p-2 text-[11px] leading-relaxed text-muted-foreground">
                              {r.matchedParagraph}
                            </p>
                          )}

                          <div className="mt-2 flex gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs"
                              onClick={() =>
                                setPreviewFor({
                                  id: r.documentId,
                                  title: r.title,
                                  fileType: r.fileType,
                                })
                              }
                            >
                              <Eye className="h-3 w-3" />
                              Preview
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs"
                              onClick={() =>
                                downloadDocument(
                                  r.documentId
                                )
                              }
                            >
                              <Download className="h-3 w-3" />
                              Download
                            </Button>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}

              {/* =================================================
                  AI CITATIONS
              ================================================= */}

              {t.citations &&
                t.citations.length > 0 && (
                  <div className="mt-3 space-y-2 border-t border-border/50 pt-2.5">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Sources
                    </p>

                    {t.citations.map(
                      (c) => (
                        <div
                          key={c.ref}
                          className="rounded-lg bg-background/60 p-2"
                        >
                          <div className="flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 shrink-0 text-primary" />

                            <span className="min-w-0 flex-1 truncate text-xs font-medium">
                              {c.title}
                              {c.page
                                ? `, p.${c.page}`
                                : ""}
                            </span>
                          </div>

                          {c.snippet && (
                            <p className="mt-1 line-clamp-2 text-[10px] text-muted-foreground">
                              {c.snippet}
                            </p>
                          )}

                          <div className="mt-1.5 flex gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs"
                              onClick={() =>
                                setPreviewFor({
                                  id: c.documentId,
                                  title: c.title,
                                  fileType: "pdf",
                                })
                              }
                            >
                              <Eye className="h-3 w-3" />
                              Preview
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs"
                              onClick={() =>
                                downloadDocument(
                                  c.documentId
                                )
                              }
                            >
                              <Download className="h-3 w-3" />
                              Download
                            </Button>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
            </div>
          </div>
        ))}

        {chat.isPending && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-muted px-4 py-2.5">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      <div className="border-t border-border p-3">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) =>
              setInput(e.target.value)
            }
            onKeyDown={(e) =>
              e.key === "Enter" && send()
            }
            placeholder="Ask for a document or a question…"
          />

          <Button
            size="icon"
            onClick={send}
            disabled={chat.isPending}
          >
            {chat.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* =====================================================
          ASK AI PREVIEW MODAL
      ===================================================== */}

      <PreviewModal
        docId={previewFor?.id ?? null}
        docTitle={previewFor?.title}
        fileType={previewFor?.fileType}
        onClose={() => setPreviewFor(null)}
        onDownload={
          previewFor
            ? () => {
                downloadDocument(
                  previewFor.id
                )

                setPreviewFor(null)
              }
            : undefined
        }
      />
    </Card>
  )
}

/* =========================================================
   RECENT SEARCHES
========================================================= */

function RecentSearches({
  onSelect,
}: {
  onSelect: (q: string) => void
}) {
  const { data } =
    useRecentSearches()

  const clear =
    useClearSearches()

  if (!data?.length) {
    return null
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          Recent searches
        </p>

        <button
          onClick={() =>
            clear.mutate()
          }
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Clear
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(data as RecentSearch[]).map(
          (item) => (
            <button
              key={item.id}
              onClick={() =>
                onSelect(item.query)
              }
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              <Clock className="h-3 w-3" />

              {item.query}

              {item.results > 0 && (
                <span className="text-[10px] text-muted-foreground/60">
                  ({item.results})
                </span>
              )}
            </button>
          )
        )}
      </div>
    </div>
  )
}