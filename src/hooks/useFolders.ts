import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { toast } from "sonner"

import {
  folderService,
  type CreateFolderPayload,
} from "@/services/folder.service"

const KEY = ["folders"]

export function useFolders(parentId?: string | null) {
  return useQuery({
    queryKey: [...KEY, parentId ?? null],
    queryFn: () => folderService.list(parentId),
  })
}

export function useCreateFolder() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateFolderPayload) =>
      folderService.create(payload),

    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: KEY })

      toast.success(
        variables.parentId
          ? "Subfolder created"
          : "Folder created"
      )
    },

    onError: (e: any) => {
      toast.error(
        e?.response?.data?.message ??
          "Couldn't create folder"
      )
    },
  })
}

export function useRenameFolder() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      name,
    }: {
      id: string
      name: string
    }) =>
      folderService.rename(id, { name }),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY })

      toast.success("Folder renamed")
    },

    onError: (e: any) => {
      toast.error(
        e?.response?.data?.message ??
          "Couldn't rename folder"
      )
    },
  })
}

export function useDeleteFolder() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      folderService.remove(id),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY })

      toast.success("Folder deleted")
    },

    onError: (e: any) => {
      toast.error(
        e?.response?.data?.message ??
          "Couldn't delete folder"
      )
    },
  })
}

// =========================================================
// MOVE DOCUMENT
// =========================================================

export function useMoveDocument() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({
      documentId,
      folderId,
    }: {
      documentId: string
      folderId: string | null
    }) =>
      folderService.moveDocument(
        documentId,
        folderId
      ),

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["documents"],
      })

      qc.invalidateQueries({
        queryKey: KEY,
      })

      toast.success(
        "Document moved successfully"
      )
    },

    onError: (e: any) => {
      toast.error(
        e?.response?.data?.message ??
          "Couldn't move document"
      )
    },
  })
}