import { useState } from "react"
import { motion } from "framer-motion"
import { Star, FileText, ArrowRight, Heart } from "lucide-react"
import { PageHeader } from "@/components/common/PageHeader"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useFavorites, useToggleFavorite } from "@/hooks/useFavorites"
import { PreviewModal } from "@/components/common/PreviewModal"
import { downloadDocument } from "@/hooks/useDocuments"

import { formatBytes } from "@/lib/utils"

export default function FavoritesPage() {
  const { data, isLoading } = useFavorites()
  const toggle = useToggleFavorite()
  const [previewFor, setPreviewFor] = useState<any>(null)

  return (
    <>
      <PageHeader title="Favorites" subtitle="Documents you've starred for quick access." />
      {isLoading && (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
      )}
      {!isLoading && (!data?.length) && (
        <Card className="flex flex-col items-center justify-center gap-3 p-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <Heart className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="font-semibold">No favorites yet</p>
          <p className="text-sm text-muted-foreground">Star any document to save it here for quick access.</p>
        </Card>
      )}
      <div className="space-y-3">
        {data?.map((doc, i) => (
          <motion.div key={doc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className="p-4 transition-shadow hover:shadow-card">
              <div className="flex items-start gap-3">
                <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-semibold">{doc.title}</p>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {doc.isPinned && <Badge variant="outline" className="text-[10px]">📌 Pinned</Badge>}
                      <Badge variant="outline" className="text-[10px]">{doc.fileType}</Badge>
                      <Badge variant="outline" className="text-[10px]">{formatBytes(doc.size)}</Badge>
                    </div>
                  </div>
                  {doc.tags?.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {doc.tags.map((t: string) => (
                        <span key={t} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">{t}</span>
                      ))}
                    </div>
                  )}
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setPreviewFor(doc)}>Preview</Button>
                    <Button size="sm" variant="outline" onClick={() => downloadDocument(doc.id)}>Download <ArrowRight className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="text-flame" onClick={() => toggle.mutate(doc.id)} disabled={toggle.isPending}>
                      <Star className="h-3.5 w-3.5 fill-flame" /> Unfavorite
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
      <PreviewModal
        docId={previewFor?.id ?? null}
        docTitle={previewFor?.title}
        fileType={previewFor?.fileType}
        onClose={() => setPreviewFor(null)}
        onDownload={previewFor ? () => { downloadDocument(previewFor.id); setPreviewFor(null) } : undefined}
      />
    </>
  )
}