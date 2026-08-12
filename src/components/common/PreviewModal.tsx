import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Download, Loader2, AlertCircle, ZoomIn, ZoomOut, RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { documentService } from "@/services/document.service"

interface PreviewModalProps {
  docId: string | null
  docTitle?: string
  fileType?: string
  onClose: () => void
  onDownload?: () => void
}

export function PreviewModal({ docId, docTitle, fileType, onClose, onDownload }: PreviewModalProps) {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)

  const isImage = fileType === "IMAGE" || ["jpg","jpeg","png","gif","webp","svg"].some(
    (ext) => docTitle?.toLowerCase().endsWith(`.${ext}`)
  )
  const isPDF = fileType === "PDF" || docTitle?.toLowerCase().endsWith(".pdf")
  useEffect(() => {
    if (!docId) { setUrl(null); setError(null); return }
    setLoading(true)
    setError(null)
    setUrl(null)
    setZoom(100)
    setRotation(0)
    documentService.getDownloadUrl(docId)
      .then(({ url }) => setUrl(url))
      .catch((err) => {
        const message = err?.response?.data?.message ?? "Could not load the file. Try downloading it instead."
        setError(message)
      })
      .finally(() => setLoading(false))
  }, [docId])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  if (!docId) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-black/60 px-4 py-3">
          <p className="truncate font-medium text-white">{docTitle ?? "Preview"}</p>
          <div className="flex shrink-0 items-center gap-1.5">
            {isImage && (
              <>
                <Button size="sm" variant="ghost" className="h-8 text-white/70 hover:text-white hover:bg-white/10"
                  onClick={() => setZoom((z) => Math.max(25, z - 25))} title="Zoom out">
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="min-w-[3rem] text-center text-sm text-white/60">{zoom}%</span>
                <Button size="sm" variant="ghost" className="h-8 text-white/70 hover:text-white hover:bg-white/10"
                  onClick={() => setZoom((z) => Math.min(200, z + 25))} title="Zoom in">
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="h-8 text-white/70 hover:text-white hover:bg-white/10"
                  onClick={() => setRotation((r) => (r + 90) % 360)} title="Rotate">
                  <RotateCw className="h-4 w-4" />
                </Button>
                <div className="mx-1 h-5 w-px bg-white/20" />
              </>
            )}
            {onDownload && (
              <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-white/70 hover:text-white hover:bg-white/10"
                onClick={onDownload}>
                <Download className="h-4 w-4" /> Download
              </Button>
            )}
            <Button size="icon" variant="ghost" className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
              onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 items-center justify-center overflow-auto p-4">
          {loading && (
            <div className="flex flex-col items-center gap-3 text-white/60">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm">Loading preview…</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-3 text-white/60">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-sm">{error}</p>
              {onDownload && (
                <Button variant="outline" size="sm" onClick={onDownload} className="mt-2">
                  <Download className="h-4 w-4" /> Download instead
                </Button>
              )}
            </div>
          )}

          {url && !loading && !error && (
            <>
              {/* PDF viewer */}
              {isPDF && (
                <iframe
                  src={url}
                  className="h-full w-full rounded-lg border-0"
                  style={{ minHeight: "70vh" }}
                  title={docTitle}
                />
              )}

              {/* Image viewer */}
              {isImage && (
                <div className="flex items-center justify-center overflow-auto">
                  <img
                    src={url}
                    alt={docTitle}
                    className="rounded-lg object-contain shadow-2xl transition-transform duration-200"
                    style={{
                      maxWidth: `${zoom}%`,
                      maxHeight: "75vh",
                      transform: `rotate(${rotation}deg)`,
                    }}
                  />
                </div>
              )}

              {/* Unsupported file type */}
              {!isPDF && !isImage && (
                <div className="flex flex-col items-center gap-3 text-white/60">
                  <AlertCircle className="h-8 w-8" />
                  <p className="text-sm">Preview not available for this file type.</p>
                  {onDownload && (
                    <Button variant="outline" size="sm" onClick={onDownload} className="mt-2">
                      <Download className="h-4 w-4" /> Download to view
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
