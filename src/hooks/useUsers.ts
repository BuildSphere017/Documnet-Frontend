import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  userService,
  type CreateUserPayload,
  type UpdateUserPayload,
} from "@/services/user.service"

const KEY = ["users"]
const CATEGORY_ACCESS_KEY = ["users", "category-access"]

export function useUsers() {
  return useQuery({
    queryKey: KEY,
    queryFn: userService.list,
  })
}

export function useCreateUser() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (p: CreateUserPayload) => userService.create(p),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY })
      qc.invalidateQueries({ queryKey: CATEGORY_ACCESS_KEY })
      toast.success("User created")
    },

    onError: (e: any) =>
      toast.error(
        e?.response?.data?.message ?? "Couldn't create user",
      ),
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      ...p
    }: UpdateUserPayload & { id: string }) =>
      userService.update(id, p),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY })
      qc.invalidateQueries({ queryKey: CATEGORY_ACCESS_KEY })
      toast.success("User updated")
    },

    onError: (e: any) =>
      toast.error(
        e?.response?.data?.message ?? "Couldn't update user",
      ),
  })
}

export function useUserActions() {
  const qc = useQueryClient()

  const refresh = () => {
    qc.invalidateQueries({ queryKey: KEY })
    qc.invalidateQueries({ queryKey: CATEGORY_ACCESS_KEY })
  }

  return {
    disable: useMutation({
      mutationFn: (id: string) => userService.disable(id),

      onSuccess: () => {
        refresh()
        toast.success("User disabled")
      },

      onError: (e: any) =>
        toast.error(
          e?.response?.data?.message ?? "Couldn't disable user",
        ),
    }),

    enable: useMutation({
      mutationFn: (id: string) => userService.enable(id),

      onSuccess: () => {
        refresh()
        toast.success("User enabled")
      },

      onError: (e: any) =>
        toast.error(
          e?.response?.data?.message ?? "Couldn't enable user",
        ),
    }),

    resetPassword: useMutation({
      mutationFn: ({
        id,
        password,
      }: {
        id: string
        password: string
      }) => userService.resetPassword(id, password),

      onSuccess: () => toast.success("Password reset"),

      onError: (e: any) =>
        toast.error(
          e?.response?.data?.message ?? "Couldn't reset password",
        ),
    }),

    remove: useMutation({
      mutationFn: (id: string) => userService.remove(id),

      onSuccess: () => {
        refresh()
        toast.success("User deleted")
      },

      onError: (e: any) =>
        toast.error(
          e?.response?.data?.message ?? "Couldn't delete user",
        ),
    }),
  }
}

// ---------------------------------------------------------
// CATEGORY ACCESS
// ---------------------------------------------------------

export function useCategoryAccess() {
  return useQuery({
    queryKey: CATEGORY_ACCESS_KEY,
    queryFn: userService.getCategoryAccess,
  })
}

export function useUpdateCategoryAccess() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      categoryIds,
    }: {
      userId: string
      categoryIds: string[]
    }) =>
      userService.updateCategoryAccess(
        userId,
        categoryIds,
      ),

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: CATEGORY_ACCESS_KEY,
      })

      qc.invalidateQueries({
        queryKey: KEY,
      })

      toast.success("Category access updated")
    },

    onError: (e: any) =>
      toast.error(
        e?.response?.data?.message ??
          "Couldn't update category access",
      ),
  })
}