import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { Users as UsersIcon, UserPlus, Loader2, KeyRound, Ban, CircleCheck, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/common/PageHeader"
import { EmptyState } from "@/components/common/EmptyState"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useCategories } from "@/hooks/useCategories"
import { useDepartments } from "@/hooks/useDepartments"
import { useUsers, useCreateUser, useUserActions } from "@/hooks/useUsers"
import type { UserWithAccess } from "@/services/user.service"
import { getInitials, cn } from "@/lib/utils"

const schema = z.object({
  fullName: z.string().min(2, "Enter a full name"),
  username: z.string().min(3, "At least 3 characters").regex(/^[a-zA-Z0-9._-]+$/, "Letters, numbers, . _ - only"),
  password: z.string().min(8, "At least 8 characters"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  role: z.enum(["SALES", "MANAGER", "ADMIN"]),
  department: z.string().optional(),
  departmentId: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

export default function UsersPage() {
  const { data: categories } = useCategories()
  const { data: departments } = useDepartments()
  const { data: users, isLoading } = useUsers()
  const createUser = useCreateUser()
  const actions = useUserActions()

  const [selectedCats, setSelectedCats] = useState<string[]>([])
  const [selectedDept, setSelectedDept] = useState<string>("")
  const [role, setRole] = useState<FormValues["role"]>("SALES")
  const [resetFor, setResetFor] = useState<UserWithAccess | null>(null)
  const [resetPw, setResetPw] = useState("")
  const [toDelete, setToDelete] = useState<UserWithAccess | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { role: "SALES" } })

  const toggleCat = (id: string) =>
    setSelectedCats((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))

  const onCreate = (values: FormValues) => {
    createUser.mutate(
      { ...values, email: values.email || undefined, role, categoryIds: selectedCats, departmentId: selectedDept || undefined },
      { onSuccess: () => { reset(); setSelectedCats([]); setRole("SALES"); setSelectedDept("") } }
    )
  }

  const roleBadge = (r: string) =>
    r === "ADMIN" ? "flame" : r === "MANAGER" ? "default" : "muted"

  const roleLabel = (r: string) =>
    r === "ADMIN" ? "Admin" : r === "MANAGER" ? "Upload Documents" : "View & Download"

  return (
    <>
      <PageHeader title="Users" subtitle="Create accounts and grant per-category access." />

      {/* Create user */}
      <Card className="mb-6 p-5 sm:p-6">
        <h2 className="mb-4 font-display text-base font-semibold">Add a user</h2>
        <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Full name <span className="text-destructive">*</span></Label>
              <Input placeholder="e.g. Arun Joshi" {...register("fullName")} />
              {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Username <span className="text-destructive">*</span></Label>
              <Input placeholder="e.g. arunjoshi" {...register("username")} />
              {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Password (min 8 chars) <span className="text-destructive">*</span></Label>
              <Input type="text" placeholder="Set a password" {...register("password")} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Email (optional)</Label>
              <Input type="email" placeholder="name@makphalt.com" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Role <span className="text-destructive">*</span></Label>
              <Select value={role} onValueChange={(v) => setRole(v as FormValues["role"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SALES">View &amp; Download Only</SelectItem>
                  <SelectItem value="MANAGER">Upload Documents</SelectItem>
                  <SelectItem value="ADMIN">Admin — Full Access</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Department <span className="text-destructive">*</span></Label>
              <Select value={selectedDept} onValueChange={setSelectedDept}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {departments?.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full inline-block" style={{ background: d.color }} />
                        {d.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!selectedDept && createUser.isPending && <p className="text-xs text-destructive">Department is required</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category access</Label>
            {!categories?.length ? (
              <p className="text-sm text-muted-foreground">Create categories first to grant access.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => {
                  const active = selectedCats.includes(c.id)
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleCat(c.id)}
                      className={cn(
                        "flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm transition-colors",
                        active ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted",
                      )}
                    >
                      <Checkbox checked={active} className="pointer-events-none" />
                      {c.name}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <Button type="submit" variant="flame" disabled={createUser.isPending}>
            {createUser.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Create user
          </Button>
        </form>
      </Card>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
      ) : !users?.length ? (
        <EmptyState icon={UsersIcon} title="No users yet" description="Create your first user above." />
      ) : (
        <div className="space-y-3">
          {users.map((u, i) => (
            <motion.div key={u.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Avatar className="h-11 w-11 ring-1 ring-border">
                    <AvatarFallback className="bg-gradient-to-br from-primary/15 to-flame/15 text-sm font-bold text-primary">
                      {getInitials(u.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{u.fullName}</p>
                      <Badge variant={roleBadge(u.role) as any}>{roleLabel(u.role)}</Badge>
                      {(u as any).dept && (
                        <Badge variant="outline" className="gap-1">
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: (u as any).dept.color }} />
                          {(u as any).dept.name}
                        </Badge>
                      )}
                      <Badge variant={u.status === "ACTIVE" ? "success" : "muted"}>{u.status.toLowerCase()}</Badge>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {u.email ?? u.username} · {u.permissions?.length ?? 0} categories · {u._count?.documents ?? 0} uploads
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setResetFor(u); setResetPw("") }}>
                      <KeyRound className="h-3.5 w-3.5" /> Reset
                    </Button>
                    {u.status === "ACTIVE" ? (
                      <Button size="sm" variant="outline" onClick={() => actions.disable.mutate(u.id)}>
                        <Ban className="h-3.5 w-3.5" /> Disable
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => actions.enable.mutate(u.id)}>
                        <CircleCheck className="h-3.5 w-3.5" /> Enable
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => setToDelete(u)}>
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Reset password dialog */}
      <Dialog open={!!resetFor} onOpenChange={(o) => !o && setResetFor(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Reset password for {resetFor?.fullName}</DialogTitle></DialogHeader>
          <div className="space-y-1.5">
            <Label>New password</Label>
            <Input type="text" value={resetPw} onChange={(e) => setResetPw(e.target.value)} placeholder="Min 8 characters" />
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setResetFor(null)}>Cancel</Button>
            <Button
              disabled={resetPw.length < 8 || actions.resetPassword.isPending}
              onClick={() => resetFor && actions.resetPassword.mutate(
                { id: resetFor.id, password: resetPw },
                { onSuccess: () => setResetFor(null) }
              )}
            >
              {actions.resetPassword.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Set password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title={`Delete ${toDelete?.fullName}?`}
        description="This disables and removes the account. This can't be undone."
        confirmLabel="Delete user"
        destructive
        loading={actions.remove.isPending}
        onConfirm={() => toDelete && actions.remove.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })}
      />
    </>
  )
}