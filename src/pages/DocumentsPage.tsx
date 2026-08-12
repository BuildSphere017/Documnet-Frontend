import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"

import {
  FileText,
  UploadCloud,
  Search as SearchIcon,
  Loader2,
  Download,
  Trash2,
  X,
  Filter,
  Sparkles,
  Loader2 as Spin,
  Eye,
  RefreshCw,
  Star,
  Tag,
} from "lucide-react"

import { toast } from "sonner"

import { PageHeader } from "@/components/common/PageHeader"
import { PreviewModal } from "@/components/common/PreviewModal"
import { EmptyState } from "@/components/common/EmptyState"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { FileTypeIcon } from "@/components/common/FileTypeIcon"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { SegmentedControl } from "@/components/common/SegmentedControl"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useCategories } from "@/hooks/useCategories"

import {
  useDocuments,
  useUploadDocument,
  useDeleteDocument,
  useReprocessDocument,
  useBulkUpload,
  downloadDocument,
} from "@/hooks/useDocuments"

import {
  useFavorites,
  useToggleFavorite,
} from "@/hooks/useFavorites"

import { useSetTags } from "@/hooks/useTags"
import { useAiSearch } from "@/hooks/useAiSearch"
import { useAuth } from "@/context/AuthContext"
import { useDebounce } from "@/hooks/useDebounce"

import {
  formatBytes,
  timeAgo,
  cn,
} from "@/lib/utils"

import type { DocumentItem } from "@/types"


/* =========================================================
   CONSTANTS
========================================================= */

const MAX_MB = 25


/* =========================================================
   FORM SCHEMA
========================================================= */

const schema = z.object({
  title: z.string().min(1, "Enter a title"),
  keyword: z.string().optional(),
  categoryId: z.string().optional(),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof schema>


/* =========================================================
   DOCUMENTS PAGE
========================================================= */

export default function DocumentsPage() {

  const { hasRole } = useAuth()

  const isAdmin = hasRole("ADMIN")

  const { data: categories } = useCategories()


  /* =======================================================
     SEARCH / FILTER STATE
  ======================================================= */

  const [search, setSearch] = useState("")

  const debounced = useDebounce(search, 350)

  const [categoryFilter, setCategoryFilter] =
    useState<string>("all")

  const [page, setPage] = useState(1)

  const [aiMode, setAiMode] = useState(false)


  const params = useMemo(
    () => ({
      q: debounced || undefined,
      categoryId:
        categoryFilter === "all"
          ? undefined
          : categoryFilter,
      page,
      pageSize: 12,
    }),
    [
      debounced,
      categoryFilter,
      page,
    ]
  )


  const {
    data,
    isLoading,
    isFetching,
  } = useDocuments(params)


  /* =======================================================
     AI SEARCH
  ======================================================= */

  const aiSearch = useAiSearch()

  const runAiSearch = () => {

    if (!search.trim()) return

    aiSearch.mutate(search.trim())
  }


  /* =======================================================
     UPLOAD / DOCUMENT ACTIONS
  ======================================================= */

  const [progress, setProgress] =
    useState<number | null>(null)

  const uploadDoc =
    useUploadDocument((p) => setProgress(p))

  const deleteDoc =
    useDeleteDocument()

  const reprocess =
    useReprocessDocument()

  const toggleFav =
    useToggleFavorite()


  /* =======================================================
     FAVORITES
  ======================================================= */

  const { data: favorites } =
    useFavorites()

  const favIds =
    new Set(
      (favorites ?? []).map(
        (f: any) => f.id
      )
    )


  /* =======================================================
     PREVIEW / TAG / DELETE STATE
  ======================================================= */

  const [previewFor, setPreviewFor] =
    useState<DocumentItem | null>(null)

  const [tagsFor, setTagsFor] =
    useState<DocumentItem | null>(null)

  const [toDelete, setToDelete] =
    useState<DocumentItem | null>(null)


  /* =======================================================
     FILE UPLOAD STATE
  ======================================================= */

  const [file, setFile] =
    useState<File | null>(null)

  const [dragging, setDragging] =
    useState(false)

  const fileInput =
    useRef<HTMLInputElement>(null)


  /* =======================================================
     FORM
  ======================================================= */

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })


  /* =======================================================
     PICK FILE
  ======================================================= */

  const pickFile = (f: File | null) => {

    if (!f) return

    if (
      f.size >
      MAX_MB * 1024 * 1024
    ) {
      toast.error(
        `File exceeds ${MAX_MB} MB`
      )

      return
    }

    setFile(f)

    setValue(
      "title",
      f.name.replace(/\.[^.]+$/, "")
    )
  }


  /* =======================================================
     DROP FILE
  ======================================================= */

  const onDrop = useCallback(
    (e: React.DragEvent) => {

      e.preventDefault()

      setDragging(false)

      pickFile(
        e.dataTransfer.files?.[0] ?? null
      )
    },
    []
  )


  /* =======================================================
     UPLOAD
  ======================================================= */

  const onUpload = (
    values: FormValues
  ) => {

    if (!file) {

      toast.error(
        "Choose a file to upload"
      )

      return
    }

    setProgress(0)

    uploadDoc.mutate(
      {
        ...values,
        categoryId:
          values.categoryId,
        file,
      },
      {
        onSuccess: () => {

          reset()

          setFile(null)

          setProgress(null)
        },

        onError: () => {
          setProgress(null)
        },
      }
    )
  }


  /* =======================================================
     PAGINATION
  ======================================================= */

  const total =
    data?.total ?? 0

  const totalPages =
    Math.max(
      1,
      Math.ceil(total / 12)
    )


  return (
    <>
      {/* ===================================================
          PAGE HEADER
      =================================================== */}

      <PageHeader
        title="Documents"
        subtitle={
          isAdmin
            ? "Upload, search and manage your entire library."
            : "Search and download from your library."
        }
      />


      {/* ===================================================
          UPLOAD — ADMIN ONLY
      =================================================== */}

      {isAdmin && (
        <Card className="mb-6 p-5 sm:p-6">

          <h2 className="mb-4 font-display text-base font-semibold">
            Upload a document
          </h2>

          <form
            onSubmit={handleSubmit(onUpload)}
            className="space-y-4"
          >

            {/* DROPZONE */}

            <div
              onDragOver={(e) => {

                e.preventDefault()

                setDragging(true)
              }}

              onDragLeave={() =>
                setDragging(false)
              }

              onDrop={onDrop}

              onClick={() =>
                fileInput.current?.click()
              }

              className={cn(
                "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors",

                dragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40 hover:bg-muted/40"
              )}
            >

              <input
                ref={fileInput}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,image/*,video/*"
                onChange={(e) =>
                  pickFile(
                    e.target.files?.[0] ?? null
                  )
                }
              />

              {file ? (

                <div className="flex max-w-full items-center gap-3">

                  <FileTypeIcon
                    type="OTHER"
                    className="h-10 w-10 shrink-0"
                  />

                  <div className="min-w-0 text-left">

                    <p className="truncate text-sm font-medium">
                      {file.name}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {formatBytes(file.size)}
                    </p>

                  </div>

                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 shrink-0"
                    onClick={(e) => {

                      e.stopPropagation()

                      setFile(null)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>

                </div>

              ) : (

                <>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">

                    <UploadCloud className="h-6 w-6" />

                  </div>

                  <p className="text-sm font-medium">
                    Drag & drop a file, or click to browse
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    PDF, DOCX, PPT, XLSX, images, video, ZIP · max {MAX_MB} MB
                  </p>
                </>
              )}

            </div>


            {/* FORM */}

            <div className="grid gap-4 sm:grid-cols-2">

              <div className="space-y-1.5">

                <Label>
                  Title
                </Label>

                <Input
                  placeholder="Document title"
                  {...register("title")}
                />

                {errors.title && (
                  <p className="text-xs text-destructive">
                    {errors.title.message}
                  </p>
                )}

              </div>


              <div className="space-y-1.5">

                <Label>
                  Keywords (optional)
                </Label>

                <Input
                  placeholder="e.g. waterproofing, XLPE, C450"
                  {...register("keyword")}
                />

                <p className="text-xs text-muted-foreground">
                  Separate multiple keywords with commas. Searching any of them finds this document.
                </p>

              </div>


              <div className="space-y-1.5">

                <Label>
                  Category
                </Label>

                <Select
                  onValueChange={(v) =>
                    setValue(
                      "categoryId",
                      v
                    )
                  }
                >

                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>

                  <SelectContent>

                    {categories?.map(
                      (c) => (
                        <SelectItem
                          key={c.id}
                          value={c.id}
                        >
                          {c.name}
                        </SelectItem>
                      )
                    )}

                  </SelectContent>

                </Select>

              </div>


              <div className="space-y-1.5 sm:row-span-2">

                <Label>
                  Description (optional)
                </Label>

                <Textarea
                  rows={4}
                  placeholder="Short description…"
                  {...register("description")}
                />

              </div>

            </div>


            {/* PROGRESS */}

            {progress !== null && (

              <div className="space-y-1">

                <Progress
                  value={progress}
                />

                <p className="text-xs text-muted-foreground">
                  Uploading… {progress}%
                </p>

              </div>
            )}


            <Button
              type="submit"
              variant="flame"
              disabled={
                uploadDoc.isPending
              }
            >

              {uploadDoc.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UploadCloud className="h-4 w-4" />
              )}

              Upload

            </Button>

          </form>

        </Card>
      )}


      {/* ===================================================
          BULK UPLOAD
      =================================================== */}

      {isAdmin && (
        <BulkUploadCard
          categories={categories}
        />
      )}


      {/* ===================================================
          SEARCH / FILTER
      =================================================== */}

      <div className="mb-2 flex flex-col gap-2 sm:flex-row">

        <div className="relative min-w-0 flex-1">

          {aiMode ? (

            <Sparkles
              className="
                absolute
                left-3
                top-1/2
                h-4
                w-4
                -translate-y-1/2
                text-flame
              "
            />

          ) : (

            <SearchIcon
              className="
                absolute
                left-3
                top-1/2
                h-4
                w-4
                -translate-y-1/2
                text-muted-foreground
              "
            />

          )}

          <Input
            value={search}
            onChange={(e) => {

              setSearch(
                e.target.value
              )

              setPage(1)
            }}
            onKeyDown={(e) => {

              if (
                aiMode &&
                e.key === "Enter"
              ) {
                runAiSearch()
              }
            }}
            placeholder={
              aiMode
                ? "Ask in plain language, e.g. “waterproofing datasheet”…"
                : "Search documents…"
            }
            className="pl-9"
          />

        </div>


        {aiMode ? (

          <Button
            variant="flame"
            className="w-full sm:w-auto"
            onClick={runAiSearch}
            disabled={
              aiSearch.isPending
            }
          >

            {aiSearch.isPending ? (
              <Spin className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}

            Search

          </Button>

        ) : (

          <Select
            value={categoryFilter}
            onValueChange={(v) => {

              setCategoryFilter(v)

              setPage(1)
            }}
          >

            <SelectTrigger className="w-full sm:w-56">

              <Filter className="mr-1 h-4 w-4" />

              <SelectValue />

            </SelectTrigger>

            <SelectContent>

              <SelectItem value="all">
                All categories
              </SelectItem>

              {categories?.map(
                (c) => (
                  <SelectItem
                    key={c.id}
                    value={c.id}
                  >
                    {c.name}
                  </SelectItem>
                )
              )}

            </SelectContent>

          </Select>

        )}

      </div>


      {/* ===================================================
          SEARCH MODE
      =================================================== */}

      <div className="mb-4 flex flex-wrap items-center gap-3">

        <SegmentedControl
          value={
            aiMode
              ? "ai"
              : "manual"
          }
          onChange={(v) => {

            setAiMode(
              v === "ai"
            )

            aiSearch.reset()
          }}
          layoutId="doc-search-mode"
          segments={[
            {
              value: "manual",
              label: "Manual",
              icon: SearchIcon,
            },
            {
              value: "ai",
              label: "AI search",
              icon: Sparkles,
            },
          ]}
        />

        <span className="text-xs text-muted-foreground">

          {aiMode
            ? "Answers ranked by meaning, cited from your documents."
            : "Searching by title, keyword & filename."}

        </span>

      </div>


      {/* ===================================================
          AI RESULTS
      =================================================== */}

      {aiMode && (
        <AiResults
          pending={aiSearch.isPending}
          data={aiSearch.data}
          onDownload={downloadDocument}
        />
      )}


      {/* ===================================================
          DOCUMENT GRID
      =================================================== */}

      {!aiMode && (
        isLoading ? (

          <div
            className="
              grid
              grid-cols-1
              gap-4
              sm:grid-cols-2
              lg:grid-cols-3
            "
          >

            {Array.from({
              length: 6,
            }).map((_, i) => (

              <Skeleton
                key={i}
                className="h-48 w-full rounded-2xl"
              />

            ))}

          </div>

        ) : !data?.items.length ? (

          <EmptyState
            icon={FileText}
            title="No documents found"
            description={
              isAdmin
                ? "Upload a document above, or adjust your search."
                : "Nothing matches your search yet."
            }
          />

        ) : (

          <div
            className={cn(
              "grid grid-cols-1 gap-4",
              "sm:grid-cols-2",
              "lg:grid-cols-3",
              "transition-opacity",
              isFetching &&
                "opacity-60"
            )}
          >

            {data.items.map(
              (doc, i) => (

                <motion.div
                  key={doc.id}
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: i * 0.03,
                  }}
                  className="min-w-0"
                >

                  <Card
                    className="
                      group
                      flex
                      h-full
                      min-w-0
                      flex-col
                      overflow-hidden
                      rounded-2xl
                      p-4
                      transition-all
                      hover:-translate-y-0.5
                      hover:shadow-card
                    "
                  >

                    {/* =================================================
                        DOCUMENT HEADER
                    ================================================== */}

                    <div className="flex min-w-0 items-start gap-3">

                      <FileTypeIcon
                        type={doc.fileType}
                        className="
                          h-11
                          w-11
                          shrink-0
                        "
                      />


                      <div className="min-w-0 flex-1">

                        <div className="flex min-w-0 items-center gap-1">

                          {doc.isPinned && (

                            <span
                              className="shrink-0 text-flame"
                              title="Pinned"
                            >
                              📌
                            </span>

                          )}

                          <p className="min-w-0 truncate font-semibold leading-tight">
                            {doc.title}
                          </p>

                        </div>


                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {doc.fileName}
                        </p>

                      </div>


                      {/* FAVORITE */}

                      <button
                        type="button"
                        onClick={() =>
                          toggleFav.mutate(
                            doc.id
                          )
                        }
                        className="
                          shrink-0
                          rounded-md
                          p-1
                          text-muted-foreground
                          transition-colors
                          hover:bg-muted
                          hover:text-flame
                        "
                        title={
                          favIds.has(doc.id)
                            ? "Remove from favorites"
                            : "Add to favorites"
                        }
                      >

                        <Star
                          className={cn(
                            "h-4 w-4",
                            favIds.has(
                              doc.id
                            ) &&
                              "fill-flame text-flame"
                          )}
                        />

                      </button>

                    </div>


                    {/* =================================================
                        CATEGORY + SIZE
                    ================================================== */}

                    <div className="mt-3 flex min-w-0 flex-wrap items-center gap-1.5">

                      {doc.category && (

                        <Badge
                          variant="outline"
                          className="max-w-full gap-1"
                          style={{
                            borderColor:
                              `${doc.category.color}55`,
                          }}
                        >

                          <span
                            className="
                              h-2
                              w-2
                              shrink-0
                              rounded-full
                            "
                            style={{
                              background:
                                doc.category
                                  .color ??
                                undefined,
                            }}
                          />

                          <span className="truncate">
                            {doc.category.name}
                          </span>

                        </Badge>

                      )}


                      <Badge
                        variant="muted"
                        className="shrink-0"
                      >
                        {formatBytes(
                          doc.size
                        )}
                      </Badge>

                    </div>


                    {/* =================================================
                        DATE
                    ================================================== */}

                    <p className="mt-2 truncate text-xs text-muted-foreground">
                      Added{" "}
                      {timeAgo(
                        doc.createdAt
                      )}
                    </p>


                    {/* =================================================
                        ACTIONS
                    ================================================== */}

                    <div className="mt-auto pt-4">

                      {/* ===============================
                          PREVIEW + DOWNLOAD
                      ================================ */}

                      <div
                        className="
                          grid
                          grid-cols-2
                          gap-1.5
                        "
                      >

                        {/* PREVIEW */}

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="
                            h-9
                            min-w-0
                            w-full
                            justify-center
                            gap-1.5
                            px-2
                            text-xs
                            sm:text-sm
                          "
                          onClick={() =>
                            setPreviewFor(
                              doc
                            )
                          }
                        >

                          <Eye className="h-3.5 w-3.5 shrink-0" />

                          <span className="truncate">
                            Preview
                          </span>

                        </Button>


                        {/* DOWNLOAD */}

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="
                            h-9
                            min-w-0
                            w-full
                            justify-center
                            gap-1.5
                            px-2
                            text-xs
                            sm:text-sm
                          "
                          onClick={() =>
                            downloadDocument(
                              doc.id
                            )
                          }
                        >

                          <Download className="h-3.5 w-3.5 shrink-0" />

                          <span className="truncate">
                            Download
                          </span>

                        </Button>

                      </div>


                      {/* ===============================
                          ADMIN ACTIONS
                      ================================ */}

                      {isAdmin && (

                        <div
                          className="
                            mt-1.5
                            flex
                            w-full
                            items-center
                            justify-end
                            gap-1
                          "
                        >

                          {/* TAGS */}

                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="
                              h-8
                              w-8
                              shrink-0
                              text-muted-foreground
                              hover:bg-muted
                            "
                            onClick={() =>
                              setTagsFor(
                                doc
                              )
                            }
                            title="Edit tags"
                          >
                            <Tag className="h-4 w-4" />
                          </Button>


                          {/* REPROCESS */}

                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="
                              h-8
                              w-8
                              shrink-0
                              text-muted-foreground
                              hover:bg-muted
                            "
                            onClick={() =>
                              reprocess.mutate(
                                doc.id
                              )
                            }
                            title="Re-process for AI search"
                            disabled={
                              reprocess.isPending
                            }
                          >

                            <RefreshCw
                              className={cn(
                                "h-4 w-4",
                                reprocess.isPending &&
                                  "animate-spin"
                              )}
                            />

                          </Button>


                          {/* DELETE */}

                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="
                              h-8
                              w-8
                              shrink-0
                              text-destructive
                              hover:bg-destructive/10
                            "
                            onClick={() =>
                              setToDelete(
                                doc
                              )
                            }
                            title="Delete"
                          >

                            <Trash2 className="h-4 w-4" />

                          </Button>

                        </div>

                      )}

                    </div>

                  </Card>

                </motion.div>

              )
            )}

          </div>
        )
      )}


      {/* ===================================================
          PAGINATION
      =================================================== */}

      {!aiMode &&
        totalPages > 1 && (

          <div
            className="
              mt-6
              flex
              flex-wrap
              items-center
              justify-center
              gap-2
            "
          >

            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() =>
                setPage(
                  (p) => p - 1
                )
              }
            >
              Previous
            </Button>

            <span className="text-sm text-muted-foreground">
              Page {page} of{" "}
              {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={
                page >= totalPages
              }
              onClick={() =>
                setPage(
                  (p) => p + 1
                )
              }
            >
              Next
            </Button>

          </div>
        )}


      {/* ===================================================
          DELETE CONFIRMATION
      =================================================== */}

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) =>
          !o &&
          setToDelete(null)
        }
        title={`Delete "${toDelete?.title}"?`}
        description="This removes the document from the library. This can't be undone."
        confirmLabel="Delete document"
        destructive
        loading={
          deleteDoc.isPending
        }
        onConfirm={() =>
          toDelete &&
          deleteDoc.mutate(
            toDelete.id,
            {
              onSuccess: () =>
                setToDelete(null),
            }
          )
        }
      />


      {/* ===================================================
          PREVIEW MODAL
      =================================================== */}

      <PreviewModal
        docId={
          previewFor?.id ?? null
        }
        docTitle={
          previewFor?.title
        }
        fileType={
          previewFor?.fileType
        }
        onClose={() =>
          setPreviewFor(null)
        }
        onDownload={
          previewFor
            ? () => {
                downloadDocument(
                  previewFor.id
                )

                setPreviewFor(
                  null
                )
              }
            : undefined
        }
      />


      {/* ===================================================
          TAG EDIT
      =================================================== */}

      <TagEditDialog
        doc={tagsFor}
        onClose={() =>
          setTagsFor(null)
        }
      />

    </>
  )
}


/* =========================================================
   AI RESULTS
========================================================= */

function AiResults({
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

  onDownload: (
    id: string
  ) => void
}) {

  if (pending) {

    return (
      <div className="mb-6 space-y-3">

        {Array.from({
          length: 3,
        }).map((_, i) => (

          <Skeleton
            key={i}
            className="h-28 rounded-2xl"
          />

        ))}

      </div>
    )
  }


  if (!data) {

    return (
      <div
        className="
          mb-6
          rounded-2xl
          border
          border-dashed
          border-border
          bg-muted/20
          px-6
          py-10
          text-center
        "
      >

        <Sparkles
          className="
            mx-auto
            mb-2
            h-6
            w-6
            text-flame
          "
        />

        <p className="text-sm font-medium">
          Ask anything about your documents
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          Type a question and press Enter — results are ranked by meaning and cited.
        </p>

      </div>
    )
  }


  if (!data.results.length) {

    return (
      <div
        className="
          mb-6
          rounded-2xl
          border
          border-dashed
          border-border
          bg-muted/20
          px-6
          py-10
          text-center
        "
      >

        <Sparkles
          className="
            mx-auto
            mb-2
            h-6
            w-6
            text-muted-foreground
          "
        />

        <p className="text-sm font-medium">
          No relevant documents found
        </p>

        <p className="mt-1 text-xs text-muted-foreground">

          Nothing in your library matched{" "}

          <span className="font-medium text-foreground">
            "{data.query}"
          </span>

          .

        </p>

        <ul className="mt-3 space-y-1 text-xs text-muted-foreground">

          <li>
            • Try different keywords or a more specific question
          </li>

          <li>
            • Make sure the document has been uploaded and processed
          </li>

          <li>
            • Switch to Manual search to search by filename
          </li>

        </ul>

      </div>
    )
  }


  return (
    <div className="mb-6 space-y-3">

      {data.results.map(
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

              <div className="flex min-w-0 items-start gap-3">

                <FileTypeIcon
                  type={
                    r.fileType as any
                  }
                  className="
                    h-10
                    w-10
                    shrink-0
                  "
                />

                <div className="min-w-0 flex-1">

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                    <p className="truncate font-semibold">
                      {r.title}
                    </p>

                    <div className="flex shrink-0 flex-wrap items-center gap-1.5">

                      {r.matchType ===
                        "keyword" && (

                        <Badge
                          variant="flame"
                          className="gap-1"
                        >

                          <Sparkles className="h-3 w-3" />

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
                        % match
                      </Badge>

                    </div>

                  </div>


                  <p
                    className="
                      mt-1.5
                      line-clamp-3
                      rounded-lg
                      bg-muted/50
                      p-2
                      text-sm
                      text-muted-foreground
                    "
                  >
                    …{r.matchedParagraph}…
                  </p>


                  <div className="mt-3">

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        onDownload(
                          r.documentId
                        )
                      }
                    >

                      <Download className="h-3.5 w-3.5" />

                      Open / Download

                    </Button>

                  </div>

                </div>

              </div>

            </Card>

          </motion.div>

        )
      )}

    </div>
  )
}


/* =========================================================
   BULK UPLOAD CARD
========================================================= */

function BulkUploadCard({
  categories,
}: {
  categories?: {
    id: string
    name: string
  }[]
}) {

  const [files, setFiles] =
    useState<File[]>([])

  const [categoryId, setCategoryId] =
    useState<string>("")

  const [dragging, setDragging] =
    useState(false)

  const [progress, setProgress] =
    useState<number | null>(null)

  const inputRef =
    useRef<HTMLInputElement>(null)

  const bulk =
    useBulkUpload(
      (p) => setProgress(p)
    )


  const addFiles = (
    list: FileList | null
  ) => {

    if (!list) return

    const arr =
      Array.from(list)

    setFiles((prev) =>
      [
        ...prev,
        ...arr,
      ].slice(0, 20)
    )
  }


  const submit = () => {

    if (!files.length)
      return

    setProgress(0)

    bulk.mutate(
      {
        files,
        categoryId:
          categoryId ||
          undefined,
      },
      {
        onSuccess: () => {

          setFiles([])

          setProgress(null)
        },

        onError: () =>
          setProgress(null),
      }
    )
  }


  return (
    <Card className="mb-6 p-5 sm:p-6">

      <h2 className="mb-1 font-display text-base font-semibold">
        Bulk upload
      </h2>

      <p className="mb-4 text-xs text-muted-foreground">
        Add up to 20 files at once. Each file's name becomes its title. Duplicates are skipped automatically.
      </p>


      {/* DROPZONE */}

      <div
        onDragOver={(e) => {

          e.preventDefault()

          setDragging(true)
        }}

        onDragLeave={() =>
          setDragging(false)
        }

        onDrop={(e) => {

          e.preventDefault()

          setDragging(false)

          addFiles(
            e.dataTransfer.files
          )
        }}

        onClick={() =>
          inputRef.current?.click()
        }

        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-6 text-center transition-colors",

          dragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/40 hover:bg-muted/40"
        )}
      >

        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,image/*,video/*"
          onChange={(e) =>
            addFiles(
              e.target.files
            )
          }
        />

        <UploadCloud
          className="
            mb-2
            h-6
            w-6
            text-primary
          "
        />

        <p className="text-sm font-medium">
          Drag & drop multiple files, or click to browse
        </p>

      </div>


      {/* SELECTED FILES */}

      {files.length > 0 && (

        <div className="mt-4 space-y-2">

          <div className="flex items-center justify-between">

            <p className="text-sm font-medium">
              {files.length} file(s) selected
            </p>

            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                setFiles([])
              }
            >
              Clear all
            </Button>

          </div>


          <div
            className="
              max-h-40
              space-y-1
              overflow-y-auto
              rounded-lg
              border
              border-border
              p-2
            "
          >

            {files.map(
              (f, i) => (

                <div
                  key={i}
                  className="
                    flex
                    min-w-0
                    items-center
                    gap-2
                    text-sm
                  "
                >

                  <FileText
                    className="
                      h-3.5
                      w-3.5
                      shrink-0
                      text-muted-foreground
                    "
                  />

                  <span className="min-w-0 flex-1 truncate">
                    {f.name}
                  </span>

                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatBytes(
                      f.size
                    )}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setFiles(
                        (prev) =>
                          prev.filter(
                            (_, idx) =>
                              idx !== i
                          )
                      )
                    }
                    className="
                      shrink-0
                      text-muted-foreground
                      hover:text-destructive
                    "
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>

                </div>

              )
            )}

          </div>


          {/* BULK OPTIONS */}

          <div
            className="
              flex
              flex-col
              gap-2
              sm:flex-row
              sm:items-center
            "
          >

            <Select
              value={categoryId}
              onValueChange={
                setCategoryId
              }
            >

              <SelectTrigger className="sm:w-56">

                <SelectValue placeholder="Category for all (optional)" />

              </SelectTrigger>

              <SelectContent>

                {categories?.map(
                  (c) => (

                    <SelectItem
                      key={c.id}
                      value={c.id}
                    >
                      {c.name}
                    </SelectItem>

                  )
                )}

              </SelectContent>

            </Select>


            <Button
              variant="flame"
              onClick={submit}
              disabled={
                bulk.isPending
              }
            >

              {bulk.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UploadCloud className="h-4 w-4" />
              )}

              Upload{" "}
              {files.length} file(s)

            </Button>

          </div>


          {/* PROGRESS */}

          {progress !== null && (

            <div className="space-y-1">

              <Progress
                value={progress}
              />

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


/* =========================================================
   TAG EDIT DIALOG
========================================================= */

function TagEditDialog({
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
      {
        id: doc.id,
        tags,
      },
      {
        onSuccess: onClose,
      }
    )
  }

  if (!doc) return null

  return (
    <>
      {/* =====================================================
          BACKDROP
          Darkens + blurs the entire page behind the tag popup.
      ====================================================== */}
      <div
        className="
          fixed
          inset-0
          z-[60]
          bg-slate-950/45
          backdrop-blur-md
          supports-[backdrop-filter]:bg-slate-950/35
        "
        onClick={onClose}
        aria-hidden="true"
      />

      {/* =====================================================
          TAG POPUP
          Responsive on mobile / tablet / desktop.
      ====================================================== */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tag-dialog-title"
        className="
          fixed
          left-1/2
          top-1/2
          z-[70]
          flex
          w-[calc(100%-2rem)]
          max-w-md
          -translate-x-1/2
          -translate-y-1/2
          flex-col
          overflow-hidden
          rounded-2xl
          border
          border-slate-200/80
          bg-white
          shadow-[0_25px_80px_rgba(15,23,42,0.30)]
          max-h-[calc(100vh-2rem)]
          sm:max-h-[calc(100vh-3rem)]
        "
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault()
            onClose()
          }
        }}
        tabIndex={-1}
      >
        {/* ===================================================
            HEADER
        ==================================================== */}
        <div
          className="
            flex
            shrink-0
            items-center
            gap-3
            border-b
            border-slate-200
            bg-white
            px-4
            py-4
            sm:px-5
          "
        >
          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-blue-50
              text-blue-600
            "
          >
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
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              text-slate-400
              transition-colors
              hover:bg-slate-100
              hover:text-slate-700
            "
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ===================================================
            CONTENT
        ==================================================== */}
        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            px-4
            py-4
            sm:px-5
            sm:py-5
          "
        >
          {/* CURRENT TAGS */}
          <div className="space-y-3">
            <div>
              <p
                className="
                  mb-2
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-wide
                  text-slate-500
                "
              >
                Current tags ({tags.length})
              </p>

              {tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="
                        inline-flex
                        max-w-full
                        items-center
                        gap-1.5
                        rounded-full
                        border
                        border-blue-200
                        bg-blue-50
                        px-3
                        py-1.5
                        text-xs
                        font-medium
                        text-blue-700
                      "
                    >
                      <Tag className="h-3 w-3 shrink-0" />

                      <span className="max-w-[180px] truncate">
                        {t}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setTags((prev) =>
                            prev.filter((x) => x !== t)
                          )
                        }
                        className="
                          ml-0.5
                          flex
                          h-4
                          w-4
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          text-blue-500
                          transition-colors
                          hover:bg-blue-200
                          hover:text-red-600
                        "
                        title="Remove tag"
                        aria-label={`Remove ${t}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <div
                  className="
                    rounded-xl
                    border
                    border-dashed
                    border-slate-300
                    bg-slate-50
                    px-4
                    py-6
                    text-center
                  "
                >
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

            {/* ADD NEW TAG */}
            <div className="pt-1">
              <p
                className="
                  mb-2
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-wide
                  text-slate-500
                "
              >
                Add new tag
              </p>

              <div
                className="
                  flex
                  flex-col
                  gap-2
                  sm:flex-row
                "
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" ||
                      e.key === ","
                    ) {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                  placeholder="e.g. waterproofing, test report, 2024"
                  className="
                    h-10
                    min-w-0
                    flex-1
                    rounded-lg
                    border-slate-300
                    text-sm
                    focus-visible:ring-2
                    focus-visible:ring-blue-500/30
                  "
                  autoFocus
                />

                <Button
                  type="button"
                  variant="outline"
                  onClick={addTag}
                  disabled={!input.trim()}
                  className="
                    h-10
                    w-full
                    shrink-0
                    rounded-lg
                    px-5
                    sm:w-auto
                  "
                >
                  Add
                </Button>
              </div>

              <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
                Press Enter or comma to add. Tags help with search and filtering.
              </p>
            </div>
          </div>
        </div>

        {/* ===================================================
            FOOTER
        ==================================================== */}
        <div
          className="
            flex
            shrink-0
            flex-col-reverse
            gap-2
            border-t
            border-slate-200
            bg-slate-50/80
            px-4
            py-4
            sm:flex-row
            sm:justify-end
            sm:px-5
          "
        >
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