import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { FolderTree, Plus, Trash2, Loader2, Check, Pencil, X } from "lucide-react"
import { PageHeader } from "@/components/common/PageHeader"
import { EmptyState } from "@/components/common/EmptyState"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory,
} from "@/hooks/useCategories"
import type { Category } from "@/types"
import { cn } from "@/lib/utils"

const SWATCHES = ["#2563EB", "#F97316", "#10B981", "#8B5CF6", "#0EA5E9", "#EF4444", "#EAB308", "#EC4899"]

const schema = z.object({ name: z.string().min(2, "Enter a category name") })
type FormValues = z.infer<typeof schema>

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories()
  const createCat = useCreateCategory()
  const updateCat = useUpdateCategory()
  const deleteCat = useDeleteCategory()

  const [color, setColor] = useState(SWATCHES[0])
  const [editing, setEditing] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [toDelete, setToDelete] = useState<Category | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<FormValues>({ resolver: zodResolver(schema) })

  const onCreate = (values: FormValues) => {
    createCat.mutate({ name: values.name, color }, { onSuccess: () => reset() })
  }

  const saveEdit = (id: string) => {
    if (editName.trim().length < 2) return
    updateCat.mutate({ id, name: editName.trim() }, { onSuccess: () => setEditing(null) })
  }

  return (
    <>
      <PageHeader title="Categories" subtitle="Organize your library. Access is granted to users per category." />

      {/* Create */}
      <Card className="mb-6 p-5">
        <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="flex-1">
              <Input placeholder="New category name" {...register("name")} />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <Button type="submit" variant="flame" disabled={createCat.isPending} className="shrink-0">
              {createCat.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add category
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Color</span>
            {SWATCHES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setColor(s)}
                aria-label={`Select ${s}`}
                className={cn(
                  "h-6 w-6 rounded-full ring-2 ring-offset-2 ring-offset-background transition-transform hover:scale-110",
                  color === s ? "ring-foreground" : "ring-transparent",
                )}
                style={{ background: s }}
              >
                {color === s && <Check className="mx-auto h-3.5 w-3.5 text-white" />}
              </button>
            ))}
          </div>
        </form>
      </Card>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
        </div>
      ) : !categories?.length ? (
        <EmptyState icon={FolderTree} title="No categories yet" description="Add your first category above to start organizing documents." />
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {categories.map((cat) => (
              <motion.div
                key={cat.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
              >
                <Card className="flex items-center gap-4 p-4 transition-shadow hover:shadow-card">
                  <span className="h-9 w-9 shrink-0 rounded-xl" style={{ background: `${cat.color}1a`, border: `1.5px solid ${cat.color}` }}>
                    <FolderTree className="mx-auto mt-[9px] h-4 w-4" style={{ color: cat.color ?? undefined }} />
                  </span>

                  {editing === cat.id ? (
                    <div className="flex flex-1 items-center gap-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveEdit(cat.id)}
                        autoFocus
                        className="h-9"
                      />
                      <Button size="icon" className="h-9 w-9" onClick={() => saveEdit(cat.id)}><Check className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => setEditing(null)}><X className="h-4 w-4" /></Button>
                    </div>
                  ) : (
                    <>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{cat.name}</p>
                      </div>
                      <Badge variant="muted" className="shrink-0 tabular-nums">
                        {cat.documentCount ?? 0} {cat.documentCount === 1 ? "doc" : "docs"}
                      </Badge>
                      <Button size="icon" variant="ghost" className="h-9 w-9 text-muted-foreground"
                        onClick={() => { setEditing(cat.id); setEditName(cat.name) }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-9 w-9 text-destructive hover:bg-destructive/10"
                        onClick={() => setToDelete(cat)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title={`Delete "${toDelete?.name}"?`}
        description="This can't be undone. Categories that still contain documents can't be deleted."
        confirmLabel="Delete category"
        destructive
        loading={deleteCat.isPending}
        onConfirm={() => toDelete && deleteCat.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })}
      />
    </>
  )
}
