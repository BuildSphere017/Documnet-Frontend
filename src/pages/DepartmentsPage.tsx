import { useState } from "react"
import { motion } from "framer-motion"
import { Building2, Plus, Loader2, Trash2, Pencil } from "lucide-react"
import { PageHeader } from "@/components/common/PageHeader"
import { EmptyState } from "@/components/common/EmptyState"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment } from "@/hooks/useDepartments"

const COLORS = ["#2563EB","#F97316","#10B981","#8B5CF6","#0EA5E9","#EF4444","#EAB308","#EC4899"]

export default function DepartmentsPage() {
  const { data: departments, isLoading } = useDepartments()
  const createDept = useCreateDepartment()
  const updateDept = useUpdateDepartment()
  const deleteDept = useDeleteDepartment()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [color, setColor] = useState(COLORS[0])
  const [editFor, setEditFor] = useState<any>(null)
  const [toDelete, setToDelete] = useState<any>(null)

  const handleCreate = () => {
    if (!name.trim()) return
    createDept.mutate({ name: name.trim(), description: description.trim() || undefined, color }, {
      onSuccess: () => { setName(""); setDescription(""); setColor(COLORS[0]) }
    })
  }

  const handleUpdate = () => {
    if (!editFor) return
    updateDept.mutate({ id: editFor.id, data: { name: editFor.name, description: editFor.description, color: editFor.color } }, {
      onSuccess: () => setEditFor(null)
    })
  }

  return (
    <>
      <PageHeader title="Departments" subtitle="Organize your team into departments. Assign users to a department when creating accounts." />

      {/* Create */}
      <Card className="mb-6 p-5 sm:p-6">
        <h2 className="mb-4 font-display text-base font-semibold">Create a department</h2>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Department name <span className="text-destructive">*</span></Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sales" />
            </div>
            <div className="space-y-1.5">
              <Label>Description (optional)</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Sales & business development" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full ring-offset-2 transition-all ${color === c ? "ring-2 ring-primary scale-110" : "hover:scale-105"}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
          <Button variant="flame" onClick={handleCreate} disabled={!name.trim() || createDept.isPending}>
            {createDept.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create department
          </Button>
        </div>
      </Card>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
      ) : !departments?.length ? (
        <EmptyState icon={Building2} title="No departments yet" description="Create your first department above." />
      ) : (
        <div className="space-y-3">
          {departments.map((d: any, i: number) => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: `${d.color}20` }}>
                    <Building2 className="h-5 w-5" style={{ color: d.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                      <p className="font-semibold">{d.name}</p>
                      <Badge variant="muted">{d._count?.users ?? 0} user{d._count?.users !== 1 ? "s" : ""}</Badge>
                    </div>
                    {d.description && <p className="mt-0.5 text-sm text-muted-foreground">{d.description}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditFor({ ...d })}>
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10"
                      onClick={() => setToDelete(d)}>
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editFor} onOpenChange={(o) => !o && setEditFor(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit department</DialogTitle></DialogHeader>
          {editFor && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input value={editFor.name} onChange={(e) => setEditFor({ ...editFor, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Input value={editFor.description ?? ""} onChange={(e) => setEditFor({ ...editFor, description: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Color</Label>
                <div className="flex gap-2">
                  {COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setEditFor({ ...editFor, color: c })}
                      className={`h-7 w-7 rounded-full ring-offset-2 transition-all ${editFor.color === c ? "ring-2 ring-primary scale-110" : "hover:scale-105"}`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditFor(null)}>Cancel</Button>
            <Button variant="flame" onClick={handleUpdate} disabled={updateDept.isPending}>
              {updateDept.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title={`Delete "${toDelete?.name}"?`}
        description="Users assigned to this department will be unassigned. This cannot be undone."
        confirmLabel="Delete department"
        destructive
        loading={deleteDept.isPending}
        onConfirm={() => toDelete && deleteDept.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })}
      />
    </>
  )
}
