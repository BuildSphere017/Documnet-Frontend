import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { categoryService, type CreateCategoryPayload, type UpdateCategoryPayload } from "@/services/category.service"

const KEY = ["categories"]

export function useCategories() {
  return useQuery({ queryKey: KEY, queryFn: categoryService.list })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: CreateCategoryPayload) => categoryService.create(p),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success("Category added") },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Couldn't add category"),
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...p }: UpdateCategoryPayload & { id: string }) => categoryService.update(id, p),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success("Category updated") },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Couldn't update category"),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => categoryService.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success("Category deleted") },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Couldn't delete category"),
  })
}
