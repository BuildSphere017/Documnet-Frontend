import { useState, useRef } from "react"
import { UploadCloud, FileText, X, Loader2 } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useBulkUpload } from "@/hooks/useDocuments"
import { cn, formatBytes } from "@/lib/utils"

/**
 * Multi-file upload card. Files whose name matches an existing
 * document are automatically saved as a new version of that document;
 * identical re-uploads are skipped.
 */
export function BulkUploadCard({
  categories,
  folderId,
}: {
  categories?: { id: string; name: string }[]
  folderId?: string
}) {
  const [files, setFiles] = useState<File[]>([])
  const [categoryId, setCategoryId] = useState<string>("")
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const bulk = useBulkUpload((p) => setProgress(p))

  const addFiles = (list: FileList | null) => {
    if (!list) return
    const arr = Array.from(list)
    setFiles((prev) => [...prev, ...arr].slice(0, 20))
  }

  const submit = () => {
    if (!files.length) return

    setProgress(0)

    bulk.mutate(
      {
        files,
        categoryId: categoryId || undefined,
        folderId,
      },
      {
        onSuccess: () => {
          setFiles([])
          setProgress(null)
        },
        onError: () => setProgress(null),
      },
    )
  }

  return (
    <Card className="mb-6 p-5 sm:p-6">
      <h2 className="mb-1 font-display text-base font-semibold">
        Bulk upload
      </h2>

      <p className="mb-4 text-xs text-muted-foreground">
        Add up to 20 files at once. Each file's name becomes its title.
        Re-uploading a file with the same name updates it as a new version;
        identical files are skipped.
      </p>

      {/* DROPZONE */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          addFiles(e.dataTransfer.files)
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-6 text-center transition-colors",
          dragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/40 hover:bg-muted/40",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,image/*,video/*"
          onChange={(e) => addFiles(e.target.files)}
        />

        <UploadCloud className="mb-2 h-6 w-6 text-primary" />

        <p className="text-sm font-medium">
          Drag &amp; drop multiple files, or click to browse
        </p>
      </div>

      {/* SELECTED FILES */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {files.length} file(s) selected
            </p>

            <Button size="sm" variant="ghost" onClick={() => setFiles([])}>
              Clear all
            </Button>
          </div>

          <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
            {files.map((f, i) => (
              <div
                key={i}
                className="flex min-w-0 items-center gap-2 text-sm"
              >
                <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />

                <span className="min-w-0 flex-1 truncate">{f.name}</span>

                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatBytes(f.size)}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setFiles((prev) =>
                      prev.filter((_, idx) => idx !== i),
                    )
                  }
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* BULK OPTIONS */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="sm:w-56">
                <SelectValue placeholder="Category for all (optional)" />
              </SelectTrigger>

              <SelectContent>
                {categories?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="flame"
              onClick={submit}
              disabled={bulk.isPending}
            >
              {bulk.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UploadCloud className="h-4 w-4" />
              )}
              Upload {files.length} file(s)
            </Button>
          </div>

          {/* PROGRESS */}
          {progress !== null && (
            <div className="space-y-1">
              <Progress value={progress} />
              <p className="text-xs text-muted-foreground">
                Uploading… {progress}%
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
