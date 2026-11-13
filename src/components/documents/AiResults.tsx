import { motion } from "framer-motion"
import { Sparkles, Download } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { FileTypeIcon } from "@/components/common/FileTypeIcon"

/**
 * Semantic ("ask anything") results panel shown on the Documents page
 * when the user runs an AI search. Pure presentational — all data and
 * actions arrive via props.
 */
export function AiResults({
  pending,
  data,
  onDownload,
}: {
  pending: boolean

  data?: {
    query: string
    results: {
      documentId: string
      title: string
      fileName: string
      fileType: string
      matchedParagraph: string
      confidence: number
      matchType?: string
    }[]
  }

  onDownload: (id: string) => void
}) {
  if (pending) {
    return (
      <div className="mb-6 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
    )
  }

  if (!data) {
    return (
      <div
        className="
          mb-6 rounded-2xl border border-dashed border-border
          bg-muted/20 px-6 py-10 text-center
        "
      >
        <Sparkles className="mx-auto mb-2 h-6 w-6 text-flame" />
        <p className="text-sm font-medium">
          Ask anything about your documents
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Type a question and press Enter — results are ranked by meaning
          and cited.
        </p>
      </div>
    )
  }

  if (!data.results.length) {
    return (
      <div
        className="
          mb-6 rounded-2xl border border-dashed border-border
          bg-muted/20 px-6 py-10 text-center
        "
      >
        <Sparkles className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
        <p className="text-sm font-medium">No relevant documents found</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Nothing in your library matched{" "}
          <span className="font-medium text-foreground">
            "{data.query}"
          </span>
          .
        </p>
        <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
          <li>• Try different keywords or a more specific question</li>
          <li>• Make sure the document has been uploaded and processed</li>
          <li>• Switch to Manual search to search by filename</li>
        </ul>
      </div>
    )
  }

  return (
    <div className="mb-6 space-y-3">
      {data.results.map((r, i) => (
        <motion.div
          key={r.documentId}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
        >
          <Card className="p-4 transition-shadow hover:shadow-card">
            <div className="flex min-w-0 items-start gap-3">
              <FileTypeIcon
                type={r.fileType as any}
                className="h-10 w-10 shrink-0"
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="truncate font-semibold">{r.title}</p>

                  <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                    {r.matchType === "keyword" && (
                      <Badge variant="flame" className="gap-1">
                        <Sparkles className="h-3 w-3" />
                        Keyword
                      </Badge>
                    )}

                    <Badge variant="success" className="tabular-nums">
                      {Math.round(r.confidence * 100)}% match
                    </Badge>
                  </div>
                </div>

                <p
                  className="
                    mt-1.5 line-clamp-3 rounded-lg bg-muted/50 p-2
                    text-sm text-muted-foreground
                  "
                >
                  …{r.matchedParagraph}…
                </p>

                <div className="mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDownload(r.documentId)}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Open / Download
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
