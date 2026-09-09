import { useState, useRef, useEffect } from "react"
import {
  motion,
  AnimatePresence,
} from "framer-motion"
import {
  Sparkles,
  X,
  Send,
  Loader2,
  FileText,
  Eye,
  Download,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

import { useAiChat } from "@/hooks/useAiSearch"

import {
  downloadDocument,
} from "@/hooks/useDocuments"

import { documentService } from "@/services/document.service"

import type {
  AiCitation,
  AiSearchResult,
} from "@/services/ai.service"

interface Msg {
  role: "user" | "assistant"
  content: string
  citations?: AiCitation[]
  results?: AiSearchResult[]
}

export function AIAssistant() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")

  const [messages, setMessages] =
    useState<Msg[]>([
      {
        role: "assistant",
        content:
          'Hi! Ask me for any document — e.g. "give me the test report of MAK Premix". I answer only from your library and attach links.',
      },
    ])

  const chat = useAiChat()

  const endRef =
    useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: "smooth",
    })
  }, [messages, chat.isPending])

  /*
   * =========================================================
   * OPEN AI DOCUMENT PREVIEW IN NEW TAB
   * =========================================================
   *
   * This function is used ONLY by the floating Dashboard
   * AI Assistant.
   *
   * Documents Page and AI Search Page are not affected.
   */
  const openDocumentInNewTab = async (
    documentId: string
  ) => {
    let newWindow: Window | null = null

    try {
      /*
       * Open the tab immediately.
       *
       * This is important because browsers can block
       * popups if window.open() happens after an await.
       */
      newWindow = window.open(
        "",
        "_blank"
      )

      if (!newWindow) {
        console.error(
          "Could not open document preview. Please allow popups for this site."
        )
        return
      }

      /*
       * Temporary loading screen.
       */
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Loading document...</title>

            <style>
              html,
              body {
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100%;
                overflow: hidden;
                background: #ffffff;
              }

              .loading {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: Arial, sans-serif;
                font-size: 14px;
                color: #666666;
              }
            </style>
          </head>

          <body>
            <div class="loading">
              Loading document...
            </div>
          </body>
        </html>
      `)

      /*
       * Get the secure preview URL.
       *
       * The service returns an object:
       *
       * {
       *   url: "...",
       *   fileName: "..."
       * }
       *
       * Therefore we use preview.url below.
       */
      const preview =
        await documentService.getPreviewUrl(
          documentId
        )

      /*
       * Navigate the newly opened tab
       * to the actual document URL.
       */
      newWindow.location.href =
        preview.url
    } catch (error) {
      console.error(
        "Failed to open document preview:",
        error
      )

      /*
       * Close the blank tab if something
       * went wrong while generating the URL.
       */
      if (
        newWindow &&
        !newWindow.closed
      ) {
        newWindow.close()
      }
    }
  }

  /*
   * =========================================================
   * SEND AI QUESTION
   * =========================================================
   */
  const send = () => {
    const q = input.trim()

    if (!q || chat.isPending) {
      return
    }

    setMessages((m) => [
      ...m,
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
          setMessages((m) => [
            ...m,
            {
              role: "assistant",
              content: res.answer,
              citations: res.citations,
              results: res.results,
            },
          ])
        },

        onError: () => {
          setMessages((m) => [
            ...m,
            {
              role: "assistant",
              content:
                "Sorry — I couldn't reach the AI just now. Please try again.",
            },
          ])
        },
      }
    )
  }

  return (
    <>
      {/* =====================================================
          FLOATING AI BUTTON
      ===================================================== */}
      <button
        onClick={() =>
          setOpen((o) => !o)
        }
        className={cn(
          "fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg transition-all hover:scale-105",
          "bg-gradient-to-br from-primary to-flame text-white"
        )}
        aria-label="Open AI assistant"
      >
        <AnimatePresence
          mode="wait"
          initial={false}
        >
          {open ? (
            <motion.span
              key="x"
              initial={{
                rotate: -90,
                opacity: 0,
              }}
              animate={{
                rotate: 0,
                opacity: 1,
              }}
              exit={{
                rotate: 90,
                opacity: 0,
              }}
            >
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span
              key="s"
              initial={{
                rotate: 90,
                opacity: 0,
              }}
              animate={{
                rotate: 0,
                opacity: 1,
              }}
              exit={{
                rotate: -90,
                opacity: 0,
              }}
            >
              <Sparkles className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* =====================================================
          AI ASSISTANT PANEL
      ===================================================== */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 20,
              scale: 0.96,
            }}
            transition={{
              duration: 0.2,
            }}
            className="fixed bottom-24 right-5 z-40 flex h-[30rem] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            {/* =================================================
                HEADER
            ================================================= */}
            <div className="flex items-center gap-2.5 border-b border-border bg-gradient-to-r from-primary/10 to-flame/10 p-3.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-flame text-white">
                <Sparkles className="h-4 w-4" />
              </div>

              <div>
                <p className="text-sm font-semibold">
                  AI Assistant
                </p>

                <p className="text-xs text-muted-foreground">
                  Grounded in your documents
                </p>
              </div>
            </div>

            {/* =================================================
                MESSAGES
            ================================================= */}
            <div className="flex-1 space-y-3 overflow-y-auto p-3.5">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex",
                    m.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p className="whitespace-pre-wrap">
                      {m.content}
                    </p>

                    {/* =================================================
                        MATCHING DOCUMENTS
                    ================================================= */}
                    {m.results &&
                      m.results.length > 0 && (
                        <div className="mt-3 space-y-2 border-t border-border/50 pt-2.5">
                          <p className="text-xs font-semibold text-muted-foreground">
                            Matching Documents
                          </p>

                          {m.results.map(
                            (r) => (
                              <div
                                key={
                                  r.documentId
                                }
                                className="rounded-lg bg-background/60 p-2"
                              >
                                <div className="flex items-center gap-1.5">
                                  <FileText className="h-3.5 w-3.5 shrink-0 text-primary" />

                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-medium">
                                      {r.title}
                                    </p>

                                    <p className="truncate text-[10px] text-muted-foreground">
                                      {r.fileName}
                                    </p>
                                  </div>
                                </div>

                                {r.matchedParagraph && (
                                  <p className="mt-1.5 line-clamp-2 rounded bg-muted/50 p-1.5 text-[10px] text-muted-foreground">
                                    {
                                      r.matchedParagraph
                                    }
                                  </p>
                                )}

                                <div className="mt-1.5 flex gap-1.5">
                                  {/* PREVIEW */}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openDocumentInNewTab(
                                        r.documentId
                                      )
                                    }
                                    className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] text-primary hover:bg-primary/10"
                                  >
                                    <Eye className="h-2.5 w-2.5" />
                                    Preview
                                  </button>

                                  {/* DOWNLOAD */}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      downloadDocument(
                                        r.documentId
                                      )
                                    }
                                    className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] text-primary hover:bg-primary/10"
                                  >
                                    <Download className="h-2.5 w-2.5" />
                                    Download
                                  </button>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      )}

                    {/* =================================================
                        AI SOURCES / CITATIONS
                    ================================================= */}
                    {m.citations &&
                      m.citations.length > 0 && (
                        <div className="mt-3 space-y-1.5 border-t border-border/50 pt-2">
                          <p className="text-[10px] font-semibold text-muted-foreground">
                            Sources
                          </p>

                          {m.citations.map(
                            (c) => (
                              <div
                                key={c.ref}
                                className="rounded-lg bg-background/60 p-1.5"
                              >
                                <div className="flex items-center gap-1.5">
                                  <FileText className="h-3 w-3 shrink-0 text-primary" />

                                  <span className="min-w-0 flex-1 truncate text-xs font-medium">
                                    {c.title}

                                    {c.page
                                      ? `, p.${c.page}`
                                      : ""}
                                  </span>
                                </div>

                                <div className="mt-1 flex gap-1">
                                  {/* PREVIEW */}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openDocumentInNewTab(
                                        c.documentId
                                      )
                                    }
                                    className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] text-primary hover:bg-primary/10"
                                  >
                                    <Eye className="h-2.5 w-2.5" />
                                    Preview
                                  </button>

                                  {/* DOWNLOAD */}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      downloadDocument(
                                        c.documentId
                                      )
                                    }
                                    className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] text-primary hover:bg-primary/10"
                                  >
                                    <Download className="h-2.5 w-2.5" />
                                    Download
                                  </button>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      )}
                  </div>
                </div>
              ))}

              {/* =================================================
                  AI LOADING
              ================================================= */}
              {chat.isPending && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-muted px-3.5 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}

              <div ref={endRef} />
            </div>

            {/* =================================================
                INPUT
            ================================================= */}
            <div className="border-t border-border p-2.5">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) =>
                    setInput(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter"
                    ) {
                      send()
                    }
                  }}
                  placeholder="Ask for a document…"
                  className="h-9"
                />

                <Button
                  size="icon"
                  className="h-9 w-9 rounded-xl"
                  onClick={send}
                  disabled={
                    chat.isPending
                  }
                >
                  {chat.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}