import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query"

import { toast } from "sonner"

import {
  documentService,
  type ListDocumentsParams,
  type UploadDocumentPayload,
} from "@/services/document.service"


// ============================================================
// DOCUMENT LIST
// ============================================================

export function useDocuments(
  params: ListDocumentsParams
) {
  return useQuery({
    queryKey: ["documents", params],
    queryFn: () => documentService.list(params),
    placeholderData: keepPreviousData,
  })
}


// ============================================================
// UPLOAD DOCUMENT
// ============================================================

export function useUploadDocument(
  onProgress?: (pct: number) => void
) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (
      p: UploadDocumentPayload
    ) =>
      documentService.upload(
        p,
        onProgress
      ),

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["documents"],
      })

      qc.invalidateQueries({
        queryKey: ["dashboard"],
      })

      toast.success(
        "Document uploaded"
      )
    },

    onError: (e: any) => {
      toast.error(
        e?.response?.data?.message ??
          "Upload failed"
      )
    },
  })
}


// ============================================================
// DELETE DOCUMENT
// ============================================================

export function useDeleteDocument() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (
      id: string
    ) =>
      documentService.remove(id),

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["documents"],
      })

      qc.invalidateQueries({
        queryKey: ["dashboard"],
      })

      toast.success(
        "Document deleted"
      )
    },

    onError: (e: any) => {
      toast.error(
        e?.response?.data?.message ??
          "Couldn't delete"
      )
    },
  })
}


// ============================================================
// BULK UPLOAD
// ============================================================

export function useBulkUpload(
  onProgress?: (pct: number) => void
) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({
      files,
      categoryId,
      folderId,
    }: {
      files: File[]
      categoryId?: string
      folderId?: string
    }) =>
      documentService.bulkUpload(
        files,
        categoryId,
        folderId,
        onProgress
      ),

    onSuccess: (data) => {
      qc.invalidateQueries({
        queryKey: ["documents"],
      })

      qc.invalidateQueries({
        queryKey: ["dashboard"],
      })

      const uploaded =
        data.results.filter(
          (r) =>
            r.status === "uploaded"
        ).length

      const dupes =
        data.results.filter(
          (r) =>
            r.status === "duplicate"
        ).length

      toast.success(
        `${uploaded} uploaded${
          dupes
            ? `, ${dupes} duplicate(s) skipped`
            : ""
        }`
      )
    },

    onError: (e: any) => {
      toast.error(
        e?.response?.data?.message ??
          "Bulk upload failed"
      )
    },
  })
}


// ============================================================
// REPROCESS DOCUMENT
// ============================================================

export function useReprocessDocument() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (
      id: string
    ) =>
      documentService.reprocess(id),

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["documents"],
      })

      toast.success(
        "Re-processing started — it'll be searchable shortly"
      )
    },

    onError: (e: any) => {
      toast.error(
        e?.response?.data?.message ??
          "Couldn't re-process"
      )
    },
  })
}


// ============================================================
// PREVIEW DOCUMENT
//
// NORMAL DOCUMENTS PAGE BEHAVIOR
//
// Uses the normal signed URL and opens in a new browser tab.
// DO NOT CHANGE THIS.
// ============================================================

export async function previewDocument(
  id: string
) {
  try {
    const {
      url,
    } =
      await documentService.getPreviewUrl(
        id
      )

    const popup =
      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      )

    // Popup blockers can prevent window.open().
    if (!popup) {
      window.location.href = url
    }
  } catch (error: any) {
    toast.error(
      error?.response?.data?.message ??
        "Couldn't preview document"
    )
  }
}


// ============================================================
// AI SEARCH PREVIEW DOCUMENT
//
// AI SEARCH ONLY
//
// Opens the document in the SAME TAB.
// The browser's native PDF viewer handles the PDF.
//
// This does NOT affect the normal Documents page.
// ============================================================

export async function previewAiDocument(
  id: string
) {
  try {
    const {
      url,
    } =
      await documentService.getPreviewUrl(
        id
      )

    // Open in the current tab.
    // For PDFs, the browser will show its native
    // PDF viewer exactly like a normal PDF URL.
    window.location.href = url

  } catch (error: any) {
    toast.error(
      error?.response?.data?.message ??
        "Couldn't preview document"
    )
  }
}


// ============================================================
// DOWNLOAD DOCUMENT
//
// IMPORTANT:
//
// This requests:
//
// /documents/:id/download?download=true
//
// The backend then creates a Supabase signed URL
// with the filename as the download parameter.
//
// We DO NOT add target="_blank" here.
// That was causing the browser to open the file instead
// of treating it as a download.
// ============================================================

export async function downloadDocument(
  id: string
) {
  try {
    const {
      url,
    } =
      await documentService.getDirectDownloadUrl(
        id
      )

    /*
     * Navigate directly to the signed download URL.
     *
     * The Supabase signed URL now contains the
     * download instruction generated by the backend.
     */
    window.location.href = url

  } catch (error: any) {
    toast.error(
      error?.response?.data?.message ??
        "Couldn't download document"
    )
  }
}