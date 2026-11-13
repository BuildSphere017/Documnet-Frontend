import { History, Download, RotateCcw, Loader2, X } from "lucide-react"

import {
  useDocumentVersions,
  useRevertVersion,
  downloadDocumentVersion,
} from "@/hooks/useDocuments"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn, formatBytes, timeAgo } from "@/lib/utils"
import type { DocumentVersionEntry } from "@/services/document.service"

/** Minimal shape needed to show version history — a full DocumentItem satisfies it. */
export interface VersionHistoryTarget {
  id: string
  title: string
}

/**
 * Version history for a single document.
 *
 * Shows the current (live) version plus every archived previous
 * version, newest first. Each entry can be downloaded — the current
 * one resolves to the live file, older ones to their archived copy.
 */
export function VersionHistoryDialog({
  doc,
  onClose,
}: {
  doc: VersionHistoryTarget | null
  onClose: () => void
}) {
  const { data, isLoading, isError } = useDocumentVersions(
    doc?.id ?? null,
  )
  const { hasRole } = useAuth()
  const revert = useRevertVersion()
  const canRevert = hasRole("ADMIN")

  if (!doc) return null

  const entries: DocumentVersionEntry[] = data
    ? [data.current, ...data.history]
    : []

  return (
    <>
      {/* Backdrop */}
      <div
        className="
          fixed inset-0 z-[60]
          bg-slate-950/45 backdrop-blur-md
          supports-[backdrop-filter]:bg-slate-950/35
        "
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="version-dialog-title"
        className="
          fixed left-1/2 top-1/2 z-[70]
          flex max-h-[85vh] w-[92vw] max-w-lg
          -translate-x-1/2 -translate-y-1/2 flex-col
          overflow-hidden rounded-2xl border border-border
          bg-card shadow-2xl
        "
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <History className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2
                id="version-dialog-title"
                className="truncate text-base font-semibold"
              >
                Version history
              </h2>
              <p className="truncate text-sm text-muted-foreground">
                {doc.title}
              </p>
            </div>
          </div>

          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 shrink-0"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading && (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}

          {isError && (
            <p className="py-10 text-center text-sm text-destructive">
              Couldn't load version history.
            </p>
          )}

          {!isLoading && !isError && (
            <ul className="space-y-2">
              {entries.map((entry) => (
                <li
                  key={entry.version}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-xl border p-3",
                    entry.isCurrent
                      ? "border-primary/40 bg-primary/5"
                      : "border-border",
                  )}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        Version {entry.version}
                      </span>
                      {entry.isCurrent && (
                        <Badge variant="secondary" className="h-5 px-1.5 text-[11px]">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {formatBytes(entry.size)}
                      {" · "}
                      {timeAgo(entry.createdAt)}
                      {entry.uploadedBy ? ` · ${entry.uploadedBy}` : ""}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    {canRevert && !entry.isCurrent && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="gap-1.5 text-muted-foreground"
                        disabled={revert.isPending}
                        onClick={() =>
                          revert.mutate({
                            id: doc.id,
                            version: entry.version,
                          })
                        }
                        title="Restore this version as current"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Restore
                      </Button>
                    )}

                    <Button
                      type="button"
                      size="sm"
                      variant={entry.isCurrent ? "default" : "outline"}
                      className="gap-1.5"
                      onClick={() =>
                        downloadDocumentVersion(doc.id, entry.version)
                      }
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </Button>
                  </div>
                </li>
              ))}

              {entries.length === 1 && (
                <p className="pt-2 text-center text-xs text-muted-foreground">
                  No previous versions yet. Re-upload a file with the same
                  name to create one.
                </p>
              )}
            </ul>
          )}
        </div>
      </div>
    </>
  )
}
