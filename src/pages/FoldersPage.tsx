import { useMemo, useState } from "react"
import { Link } from "react-router-dom"

import {
  Folder,
  FolderPlus,
  ChevronRight,
  ArrowLeft,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
  FileText,
} from "lucide-react"

import { PageHeader } from "@/components/common/PageHeader"
import { EmptyState } from "@/components/common/EmptyState"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

import {
  useCreateFolder,
  useDeleteFolder,
  useFolders,
  useRenameFolder,
} from "@/hooks/useFolders"

import { useAuth } from "@/context/AuthContext"

interface BreadcrumbItem {
  id: string
  name: string
}

export default function FoldersPage() {
  const { user } = useAuth()

  const isAdmin = user?.role === "ADMIN"

  const [currentFolderId, setCurrentFolderId] =
    useState<string | null>(null)

  const [breadcrumbs, setBreadcrumbs] =
    useState<BreadcrumbItem[]>([])

  const [showCreate, setShowCreate] =
    useState(false)

  const [newFolderName, setNewFolderName] =
    useState("")

  const [editingId, setEditingId] =
    useState<string | null>(null)

  const [editingName, setEditingName] =
    useState("")

  const [toDelete, setToDelete] =
    useState<{
      id: string
      name: string
    } | null>(null)

  const {
    data: folders,
    isLoading,
    isError,
  } = useFolders(currentFolderId)

  const createFolder = useCreateFolder()
  const renameFolder = useRenameFolder()
  const deleteFolder = useDeleteFolder()

  const currentTitle = useMemo(() => {
    if (!currentFolderId) return "Folders"

    return (
      breadcrumbs[breadcrumbs.length - 1]?.name ??
      "Folder"
    )
  }, [currentFolderId, breadcrumbs])

  const openFolder = (id: string, name: string) => {
    setCurrentFolderId(id)

    setBreadcrumbs((current) => [
      ...current,
      { id, name },
    ])

    setShowCreate(false)
    setEditingId(null)
  }

  const goBack = () => {
    if (!currentFolderId) return

    const nextBreadcrumbs =
      breadcrumbs.slice(0, -1)

    const parent =
      nextBreadcrumbs[nextBreadcrumbs.length - 1]

    setBreadcrumbs(nextBreadcrumbs)

    setCurrentFolderId(parent?.id ?? null)

    setShowCreate(false)
    setEditingId(null)
  }

  const goToBreadcrumb = (index: number) => {
    if (index < 0) {
      setCurrentFolderId(null)
      setBreadcrumbs([])
      return
    }

    const target = breadcrumbs[index]

    setCurrentFolderId(target.id)
    setBreadcrumbs(
      breadcrumbs.slice(0, index + 1)
    )

    setShowCreate(false)
    setEditingId(null)
  }

  const handleCreate = () => {
    const name = newFolderName.trim()

    if (!name) return

    createFolder.mutate(
      {
        name,
        parentId: currentFolderId,
      },
      {
        onSuccess: () => {
          setNewFolderName("")
          setShowCreate(false)
        },
      }
    )
  }

  const startRename = (
    id: string,
    name: string
  ) => {
    setEditingId(id)
    setEditingName(name)
  }

  const saveRename = (id: string) => {
    const name = editingName.trim()

    if (!name) return

    renameFolder.mutate(
      {
        id,
        name,
      },
      {
        onSuccess: () => {
          setEditingId(null)
          setEditingName("")
        },
      }
    )
  }

  return (
    <>
      <PageHeader
        title={currentTitle}
        subtitle="Organize documents into folders and unlimited subfolders."
      />

      {/* Breadcrumb / navigation */}
      <div className="mb-5 flex flex-wrap items-center gap-1 text-sm">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={() => goToBreadcrumb(-1)}
        >
          <Folder className="mr-1.5 h-4 w-4" />
          Root
        </Button>

        {breadcrumbs.map((item, index) => (
          <div
            key={item.id}
            className="flex items-center"
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />

            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() =>
                goToBreadcrumb(index)
              }
            >
              {item.name}
            </Button>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <Card className="mb-6 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            {currentFolderId && (
              <Button
                variant="outline"
                size="sm"
                onClick={goBack}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}

            <span className="text-sm text-muted-foreground">
              {folders?.length ?? 0}{" "}
              {(folders?.length ?? 0) === 1
                ? "folder"
                : "folders"}
            </span>
          </div>

          {isAdmin && (
            <Button
              variant="flame"
              size="sm"
              onClick={() =>
                setShowCreate((value) => !value)
              }
            >
              <FolderPlus className="mr-2 h-4 w-4" />
              New folder
            </Button>
          )}
        </div>

        {isAdmin && showCreate && (
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Input
              value={newFolderName}
              onChange={(e) =>
                setNewFolderName(e.target.value)
              }
              placeholder={
                currentFolderId
                  ? "New subfolder name"
                  : "New folder name"
              }
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreate()
                }

                if (e.key === "Escape") {
                  setShowCreate(false)
                  setNewFolderName("")
                }
              }}
            />

            <Button
              onClick={handleCreate}
              disabled={
                !newFolderName.trim() ||
                createFolder.isPending
              }
            >
              {createFolder.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}

              Create
            </Button>

            <Button
              variant="ghost"
              onClick={() => {
                setShowCreate(false)
                setNewFolderName("")
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </Card>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map(
            (_, index) => (
              <Skeleton
                key={index}
                className="h-20 rounded-2xl"
              />
            )
          )}
        </div>
      )}

      {/* Error */}
      {isError && (
        <EmptyState
          icon={Folder}
          title="Couldn't load folders"
          description="Please refresh the page and try again."
        />
      )}

      {/* Empty */}
      {!isLoading &&
        !isError &&
        !folders?.length && (
          <EmptyState
            icon={Folder}
            title={
              currentFolderId
                ? "No subfolders yet"
                : "No folders yet"
            }
            description={
              isAdmin
                ? "Create a folder to start organizing your documents."
                : "No folders have been created yet."
            }
          />
        )}

      {/* Folder list */}
      {!isLoading &&
        !isError &&
        !!folders?.length && (
          <div className="space-y-3">
            {folders.map((folder) => (
              <Card
                key={folder.id}
                className="flex items-center gap-3 p-4 transition-shadow hover:shadow-card"
              >
                <button
                  type="button"
                  onClick={() =>
                    openFolder(
                      folder.id,
                      folder.name
                    )
                  }
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Folder className="h-5 w-5 text-primary" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">
                      {folder.name}
                    </span>

                    <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        {folder.childCount ?? 0}{" "}
                        {(folder.childCount ?? 0) ===
                        1
                          ? "subfolder"
                          : "subfolders"}
                      </span>

                      <span>•</span>

                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {folder.documentCount ??
                          0}{" "}
                        {(folder.documentCount ?? 0) ===
                        1
                          ? "document"
                          : "documents"}
                      </span>
                    </span>
                  </span>

                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                </button>

                {/* Open documents in this folder */}
                <Link
                  to={`/documents?folderId=${encodeURIComponent(folder.id)}`}
                  onClick={(e) => e.stopPropagation()}
                  className="shrink-0"
                >
                  <Button
                    size="sm"
                    variant="outline"
                    className="hidden sm:inline-flex"
                  >
                    Open documents
                  </Button>
                </Link>

                {editingId === folder.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editingName}
                      onChange={(e) =>
                        setEditingName(
                          e.target.value
                        )
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          saveRename(folder.id)
                        }

                        if (e.key === "Escape") {
                          setEditingId(null)
                        }
                      }}
                      autoFocus
                      className="h-9 w-40 sm:w-56"
                    />

                    <Button
                      size="icon"
                      className="h-9 w-9"
                      disabled={
                        renameFolder.isPending
                      }
                      onClick={() =>
                        saveRename(folder.id)
                      }
                    >
                      {renameFolder.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9"
                      onClick={() =>
                        setEditingId(null)
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  isAdmin && (
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 text-muted-foreground"
                        onClick={() =>
                          startRename(
                            folder.id,
                            folder.name
                          )
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 text-destructive hover:bg-destructive/10"
                        onClick={() =>
                          setToDelete({
                            id: folder.id,
                            name: folder.name,
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                )}
              </Card>
            ))}
          </div>
        )}

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(open) => {
          if (!open) setToDelete(null)
        }}
        title={`Delete "${toDelete?.name}"?`}
        description="Only empty folders can be deleted. Documents and subfolders must be moved first."
        confirmLabel="Delete folder"
        destructive
        loading={deleteFolder.isPending}
        onConfirm={() => {
          if (!toDelete) return

          deleteFolder.mutate(toDelete.id, {
            onSuccess: () =>
              setToDelete(null),
          })
        }}
      />
    </>
  )
}