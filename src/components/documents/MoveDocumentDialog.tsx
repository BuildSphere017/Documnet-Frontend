import { useState, useEffect } from "react"
import { toast } from "sonner"
import { FolderOpen, X, Check, ChevronRight, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useMoveDocument, useFolders } from "@/hooks/useFolders"
import { cn } from "@/lib/utils"
import type { DocumentItem, Folder } from "@/types"

/** Move a document to another folder (or root) via a recursive folder tree. */
export function MoveDocumentDialog({
  doc,
  currentFolderId,
  onClose,
}: {
  doc: DocumentItem | null
  currentFolderId: string | null
  onClose: () => void
}) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(
    currentFolderId,
  )

  const moveMutation = useMoveDocument()

  useEffect(() => {
    if (doc) {
      setSelectedFolderId(currentFolderId)
    }
  }, [doc, currentFolderId])

  if (!doc) return null

  const handleMove = () => {
    if (selectedFolderId === currentFolderId) {
      toast.error("Document is already in this folder")
      return
    }

    moveMutation.mutate(
      { documentId: doc.id, folderId: selectedFolderId },
      { onSuccess: onClose },
    )
  }

  return (
    <>
      <div
        className="
          fixed inset-0 z-[60] bg-slate-950/45 backdrop-blur-md
          supports-[backdrop-filter]:bg-slate-950/35
        "
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="move-document-dialog-title"
        className="
          fixed left-1/2 top-1/2 z-[70] flex w-[calc(100%-2rem)] max-w-lg
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
        <div className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:px-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FolderOpen className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            <h2
              id="move-document-dialog-title"
              className="truncate text-base font-semibold text-slate-900 sm:text-lg"
            >
              Move document
            </h2>

            <p className="mt-0.5 truncate text-xs text-slate-500">
              {doc.title}
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

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Choose destination
          </p>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50/50">
            <button
              type="button"
              onClick={() => setSelectedFolderId(null)}
              disabled={currentFolderId === null}
              className={cn(
                "flex w-full items-center gap-3 border-b px-3 py-3 text-left transition-colors",
                currentFolderId === null
                  ? "cursor-not-allowed opacity-60"
                  : "hover:bg-white",
                selectedFolderId === null && "bg-primary/5",
              )}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <FolderOpen className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Root</p>
                <p className="text-xs text-muted-foreground">
                  Documents outside folders
                </p>
              </div>

              {selectedFolderId === null && (
                <Check className="h-4 w-4 shrink-0 text-primary" />
              )}
            </button>

            <div className="max-h-[45vh] overflow-y-auto p-2">
              <FolderTreeNode
                parentId={null}
                selectedFolderId={selectedFolderId}
                currentFolderId={currentFolderId}
                onSelect={setSelectedFolderId}
              />
            </div>
          </div>
        </div>

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
            onClick={handleMove}
            disabled={
              moveMutation.isPending ||
              selectedFolderId === currentFolderId
            }
            className="h-10 w-full rounded-lg sm:w-auto"
          >
            {moveMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Moving...
              </>
            ) : (
              <>
                <FolderOpen className="h-4 w-4" />
                Move here
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  )
}

/* Recursive folder tree used by the move dialog. */

function FolderTreeNode({
  parentId,
  selectedFolderId,
  currentFolderId,
  onSelect,
}: {
  parentId: string | null
  selectedFolderId: string | null
  currentFolderId: string | null
  onSelect: (folderId: string) => void
}) {
  const { data: folders, isLoading } = useFolders(parentId)

  if (isLoading) {
    return (
      <div className="space-y-2 p-2">
        <Skeleton className="h-9 w-full rounded-lg" />
        <Skeleton className="h-9 w-4/5 rounded-lg" />
      </div>
    )
  }

  if (!folders?.length) {
    if (parentId === null) {
      return (
        <div className="px-3 py-6 text-center text-xs text-muted-foreground">
          No folders created yet.
        </div>
      )
    }

    return null
  }

  return (
    <div className="space-y-1">
      {folders.map((folder) => (
        <FolderTreeItem
          key={folder.id}
          folder={folder}
          selectedFolderId={selectedFolderId}
          currentFolderId={currentFolderId}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

function FolderTreeItem({
  folder,
  selectedFolderId,
  currentFolderId,
  onSelect,
}: {
  folder: Folder
  selectedFolderId: string | null
  currentFolderId: string | null
  onSelect: (folderId: string) => void
}) {
  const [expanded, setExpanded] = useState(false)

  const hasChildren = (folder.childCount ?? 0) > 0
  const isSelected = selectedFolderId === folder.id
  const isCurrent = currentFolderId === folder.id

  return (
    <div>
      <div
        className={cn(
          "flex min-w-0 items-center gap-1 rounded-lg border transition-colors",
          isSelected
            ? "border-primary/30 bg-primary/5"
            : "border-transparent hover:bg-white",
          isCurrent && "opacity-60",
        )}
      >
        <button
          type="button"
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-transform",
            hasChildren ? "hover:bg-muted" : "cursor-default opacity-30",
          )}
          onClick={() => {
            if (hasChildren) {
              setExpanded((value) => !value)
            }
          }}
          disabled={!hasChildren}
          aria-label={expanded ? "Collapse folder" : "Expand folder"}
        >
          <ChevronRight
            className={cn(
              "h-4 w-4 transition-transform",
              expanded && "rotate-90",
            )}
          />
        </button>

        <button
          type="button"
          onClick={() => {
            if (!isCurrent) {
              onSelect(folder.id)
            }
          }}
          disabled={isCurrent}
          className="flex min-w-0 flex-1 items-center gap-2 py-2 pr-3 text-left"
        >
          <FolderOpen
            className={cn(
              "h-4 w-4 shrink-0",
              isSelected ? "text-primary" : "text-muted-foreground",
            )}
          />

          <span className="min-w-0 flex-1 truncate text-sm">
            {folder.name}
          </span>

          {isCurrent && (
            <span className="shrink-0 text-[10px] font-medium text-muted-foreground">
              Current
            </span>
          )}

          {isSelected && !isCurrent && (
            <Check className="h-4 w-4 shrink-0 text-primary" />
          )}
        </button>
      </div>

      {expanded && hasChildren && (
        <div className="ml-5 border-l border-border pl-2">
          <FolderTreeNode
            parentId={folder.id}
            selectedFolderId={selectedFolderId}
            currentFolderId={currentFolderId}
            onSelect={onSelect}
          />
        </div>
      )}
    </div>
  )
}
