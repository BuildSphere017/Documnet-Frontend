import { useState, useCallback, useRef, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"

import {
  FileText,
  FolderOpen,
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
  History,
} from "lucide-react"

import { toast } from "sonner"

import { PageHeader } from "@/components/common/PageHeader"
import { PreviewModal } from "@/components/common/PreviewModal"
import { EmptyState } from "@/components/common/EmptyState"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { FileTypeIcon } from "@/components/common/FileTypeIcon"
import { VersionHistoryDialog } from "@/components/documents/VersionHistoryDialog"
import { AiResults } from "@/components/documents/AiResults"
import { BulkUploadCard } from "@/components/documents/BulkUploadCard"
import { TagEditDialog } from "@/components/documents/TagEditDialog"
import { MoveDocumentDialog } from "@/components/documents/MoveDocumentDialog"

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
  downloadDocument,
} from "@/hooks/useDocuments"

import {
  useFavorites,
  useToggleFavorite,
} from "@/hooks/useFavorites"

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

  const { user, hasRole } = useAuth()

  const [searchParams] = useSearchParams()

  const currentFolderId =
    searchParams.get("folderId") || undefined

  const isAdmin = hasRole("ADMIN")
  const isCRM = user?.department?.trim().toUpperCase() === "CRM"
  const canUpload = isAdmin || isCRM

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
      folderId: currentFolderId,
      page,
      pageSize: 12,
    }),
    [
      debounced,
      categoryFilter,
      currentFolderId,
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

  const [moveFor, setMoveFor] =
    useState<DocumentItem | null>(null)

  const [versionsFor, setVersionsFor] =
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
        categoryId: values.categoryId,
        folderId: currentFolderId,
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
          canUpload
            ? "Upload, search and manage your entire library."
            : "Search and download from your library."
        }
      />

      {currentFolderId && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3">
          <FolderOpen className="h-4 w-4 text-primary" />
          <span className="text-sm text-muted-foreground">
            Viewing documents inside the selected folder
          </span>
        </div>
      )}


      {/* ===================================================
          UPLOAD — ADMIN ONLY
      =================================================== */}

      {canUpload && (
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

      {canUpload && (
        <BulkUploadCard
          categories={categories}
          folderId={currentFolderId}
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
              canUpload
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


                          {/* VERSION HISTORY */}

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
                              setVersionsFor(doc)
                            }
                            title="Version history"
                          >
                            <History className="h-4 w-4" />
                          </Button>


                          {/* MOVE */}

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
                              setMoveFor(doc)
                            }
                            title="Move document"
                          >
                            <FolderOpen className="h-4 w-4" />
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

      <MoveDocumentDialog
        doc={moveFor}
        currentFolderId={moveFor?.folderId ?? currentFolderId ?? null}
        onClose={() =>
          setMoveFor(null)
        }
      />

      <VersionHistoryDialog
        doc={versionsFor}
        onClose={() =>
          setVersionsFor(null)
        }
      />

    </>
  )
}
