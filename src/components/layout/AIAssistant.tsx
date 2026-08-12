import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, X, Send, Loader2, FileText, Eye, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useAiChat } from "@/hooks/useAiSearch"
import { previewDocument, downloadDocument } from "@/hooks/useDocuments"
import type { AiCitation } from "@/services/ai.service"

interface Msg { role: "user" | "assistant"; content: string; citations?: AiCitation[] }

export function AIAssistant() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi! Ask me for any document — e.g. “give me the test report of MAK Premix”. I answer only from your library and attach links." },
  ])
  const chat = useAiChat()
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages, chat.isPending])

  const send = () => {
    const q = input.trim()
    if (!q || chat.isPending) return
    setMessages((m) => [...m, { role: "user", content: q }])
    setInput("")
    chat.mutate({ question: q }, {
      onSuccess: (res) => setMessages((m) => [...m, { role: "assistant", content: res.answer, citations: res.citations }]),
      onError: () => setMessages((m) => [...m, { role: "assistant", content: "Sorry — I couldn't reach the AI just now. Please try again." }]),
    })
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg transition-all hover:scale-105",
          "bg-gradient-to-br from-primary to-flame text-white",
        )}
        aria-label="Open AI assistant"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open
            ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><X className="h-6 w-6" /></motion.span>
            : <motion.span key="s" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><Sparkles className="h-6 w-6" /></motion.span>}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-5 z-40 flex h-[30rem] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center gap-2.5 border-b border-border bg-gradient-to-r from-primary/10 to-flame/10 p-3.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-flame text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">AI Assistant</p>
                <p className="text-xs text-muted-foreground">Grounded in your documents</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto p-3.5">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[85%] rounded-2xl px-3.5 py-2 text-sm", m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted")}>
                    <p className="whitespace-pre-wrap">{m.content}</p>
                    {m.citations && m.citations.length > 0 && (
                      <div className="mt-2.5 space-y-1.5 border-t border-border/50 pt-2">
                        {m.citations.map((c) => (
                          <div key={c.ref} className="rounded-lg bg-background/60 p-1.5">
                            <div className="flex items-center gap-1.5">
                              <FileText className="h-3 w-3 shrink-0 text-primary" />
                              <span className="min-w-0 flex-1 truncate text-xs font-medium">{c.title}</span>
                            </div>
                            <div className="mt-1 flex gap-1">
                              <button onClick={() => previewDocument(c.documentId)} className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] text-primary hover:bg-primary/10">
                                <Eye className="h-2.5 w-2.5" /> Preview
                              </button>
                              <button onClick={() => downloadDocument(c.documentId)} className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] text-primary hover:bg-primary/10">
                                <Download className="h-2.5 w-2.5" /> Download
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {chat.isPending && (
                <div className="flex justify-start"><div className="rounded-2xl bg-muted px-3.5 py-2"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div></div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border p-2.5">
              <div className="flex gap-2">
                <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask for a document…" className="h-9" />
                <Button size="icon" className="h-9 w-9 rounded-xl" onClick={send} disabled={chat.isPending}>
                  {chat.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}