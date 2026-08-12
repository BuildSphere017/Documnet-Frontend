import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { toast } from "sonner"

export interface Department {
  id: string
  name: string
  description?: string
  color: string
  _count?: { users: number }
  createdAt: string
}

const deptApi = {
  list: async (): Promise<Department[]> => { const { data } = await api.get("/departments"); return data },
  create: async (d: { name: string; description?: string; color?: string }): Promise<Department> => { const { data } = await api.post("/departments", d); return data },
  update: async ({ id, data: d }: { id: string; data: Partial<Department> }): Promise<Department> => { const { data } = await api.patch(`/departments/${id}`, d); return data },
  remove: async (id: string): Promise<void> => { await api.delete(`/departments/${id}`) },
}

export function useDepartments() {
  return useQuery({ queryKey: ["departments"], queryFn: deptApi.list, staleTime: 5 * 60_000 })
}

export function useCreateDepartment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deptApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["departments"] }); toast.success("Department created") },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed to create department"),
  })
}

export function useUpdateDepartment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deptApi.update,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["departments"] }); toast.success("Department updated") },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed to update department"),
  })
}

export function useDeleteDepartment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deptApi.remove,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["departments"] }); qc.invalidateQueries({ queryKey: ["users"] }); toast.success("Department deleted") },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed to delete department"),
  })
}
