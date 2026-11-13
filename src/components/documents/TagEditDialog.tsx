import { useState, useEffect } from "react"
import { Tag, X, Loader2 } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useSetTags } from "@/hooks/useTags"
import type { DocumentItem } from "@/types"

/** Add / remove tags for a single document. */
export function TagEditDialog({
  doc,
  onClose,
}: {
  doc: DocumentItem | null
  onClose: () => void
}) {
  const [input, setInput] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const setTagsMutation = useSetTags()

  useEffect(() => {
    if (doc) {
      setTags(doc.tags ?? [])
      setInput("")
    }
  }, [doc])

  const addTag = () => {
    const t = input.trim().toLowerCase()

    if (t && !tags.includes(t)) {
      setTags((prev) => [...prev, t])
    }

    setInput("")
  }

  const save = () => {
    if (!doc) return

    setTagsMutation.mutate(
      { id: doc.id, tags },
      { onSuccess: onClose },
    )
  }

  if (!doc) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="
          fixed inset-0 z-[60] bg-slate-950/45 backdrop-blur-md
          supports-[backdrop-filter]:bg-slate-950/35
        "
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Popup */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tag-dialog-title"
        className="
          fixed left-1/2 top-1/2 z-[70] flex w-[calc(100%-2rem)] max-w-md
          -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden
          rounded-2xl border border-slate-200/80 bg-white
          shadow-[0_25px_80px_rgba(15,23,42,0.30)]
          max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)]
        "
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault()
            onClose()
          }
        }}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:px-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Tag className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            <h2
              id="tag-dialog-title"
              className="truncate text-base font-semibold text-slate-900 sm:text-lg"
            >
              Tags — {doc.title}
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Add or remove tags for this document.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
          <div className="space-y-3">
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Current tags ({tags.length})
              </p>

              {tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700"
                    >
                      <Tag className="h-3 w-3 shrink-0" />

                      <span className="max-w-[180px] truncate">{t}</span>

                      <button
                        type="button"
                        onClick={() =>
                          setTags((prev) => prev.filter((x) => x !== t))
                        }
                        className="ml-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-blue-500 transition-colors hover:bg-blue-200 hover:text-red-600"
                        title="Remove tag"
                        aria-label={`Remove ${t}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
                  <Tag className="mx-auto mb-2 h-5 w-5 text-slate-400" />

                  <p className="text-sm font-medium text-slate-600">
                    No tags yet for this document.
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Add tags below to make it easier to find.
                  </p>
                </div>
              )}
            </div>

            {/* Add new tag */}
            <div className="pt-1">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Add new tag
              </p>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                  placeholder="e.g. waterproofing, test report, 2024"
                  className="h-10 min-w-0 flex-1 rounded-lg border-slate-300 text-sm focus-visible:ring-2 focus-visible:ring-blue-500/30"
                  autoFocus
                />

                <Button
                  type="button"
                  variant="outline"
                  onClick={addTag}
                  disabled={!input.trim()}
                  className="h-10 w-full shrink-0 rounded-lg px-5 sm:w-auto"
                >
                  Add
                </Button>
              </div>

              <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
                Press Enter or comma to add. Tags help with search and
                filtering.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50/80 px-4 py-4 sm:flex-row sm:justify-end sm:px-5">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-10 w-full rounded-lg sm:w-auto"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="flame"
            onClick={save}
            disabled={setTagsMutation.isPending}
            className="h-10 w-full rounded-lg sm:w-auto"
          >
            {setTagsMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save tags"
            )}
          </Button>
        </div>
      </div>
    </>
  )
}
