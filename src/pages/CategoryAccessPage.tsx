import { useMemo, useState } from "react"
import {
  Check,
  ChevronDown,
  ChevronRight,
  Search,
  ShieldCheck,
  UserCog,
  Users,
  X,
} from "lucide-react"

import {
  useCategoryAccess,
  useUpdateCategoryAccess,
} from "@/hooks/useUsers"

interface CategoryAccessUser {
  id: string
  username: string
  email: string
  role: string
  categoryIds: string[]
}

interface CategoryAccessCategory {
  id: string
  name: string
}

export default function CategoryAccessPage() {
  const { data, isLoading, isError } = useCategoryAccess()
  const updateCategoryAccess = useUpdateCategoryAccess()

  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(
    new Set(),
  )

  const [selectedCategories, setSelectedCategories] = useState<
    Record<string, string[]>
  >({})

  const [userSearch, setUserSearch] = useState("")
  const [categorySearch, setCategorySearch] = useState("")
  const [savingUserId, setSavingUserId] = useState<string | null>(null)

  const users = (data?.users ?? []) as CategoryAccessUser[]
  const categories = (data?.categories ?? []) as CategoryAccessCategory[]

  const filteredUsers = useMemo(() => {
    const search = userSearch.trim().toLowerCase()

    if (!search) {
      return users
    }

    return users.filter((user) =>
      [
        user.username ?? "",
        user.email ?? "",
        user.role ?? "",
      ].some((value) =>
        value.toLowerCase().includes(search),
      ),
    )
  }, [users, userSearch])

  const filteredCategories = useMemo(() => {
    const search = categorySearch.trim().toLowerCase()

    if (!search) {
      return categories
    }

    return categories.filter((category) =>
      category.name.toLowerCase().includes(search),
    )
  }, [categories, categorySearch])

  function getSelectedCategories(user: CategoryAccessUser) {
    return selectedCategories[user.id] ?? user.categoryIds ?? []
  }

  function toggleUser(userId: string) {
    setExpandedUsers((current) => {
      const next = new Set(current)

      if (next.has(userId)) {
        next.delete(userId)
      } else {
        next.add(userId)
      }

      return next
    })
  }

  function toggleCategory(
    user: CategoryAccessUser,
    categoryId: string,
  ) {
    setSelectedCategories((currentState) => {
      const current =
        currentState[user.id] ?? user.categoryIds ?? []

      const next = current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId]

      return {
        ...currentState,
        [user.id]: next,
      }
    })
  }

  function selectAll(user: CategoryAccessUser) {
    setSelectedCategories((current) => ({
      ...current,
      [user.id]: categories.map((category) => category.id),
    }))
  }

  function clearAll(user: CategoryAccessUser) {
    setSelectedCategories((current) => ({
      ...current,
      [user.id]: [],
    }))
  }

  function saveAccess(user: CategoryAccessUser) {
    const categoryIds = getSelectedCategories(user)

    setSavingUserId(user.id)

    updateCategoryAccess.mutate(
      {
        userId: user.id,
        categoryIds,
      },
      {
        onSettled: () => {
          setSavingUserId(null)
        },
      },
    )
  }

  function hasChanges(user: CategoryAccessUser) {
    const selected = selectedCategories[user.id]

    if (!selected) {
      return false
    }

    const original = [...(user.categoryIds ?? [])].sort()
    const current = [...selected].sort()

    if (original.length !== current.length) {
      return true
    }

    return original.some(
      (id, index) => id !== current[index],
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-sm text-muted-foreground">
          Loading category access...
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-destructive" />

        <h2 className="text-lg font-semibold">
          Unable to load category access
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Please refresh the page and try again.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <UserCog className="h-5 w-5 text-primary" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Category Access
            </h1>

            <p className="text-sm text-muted-foreground">
              Manage which categories each user can access.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2">
          <Users className="h-4 w-4 text-muted-foreground" />

          <span className="text-sm font-medium">
            {users.length}{" "}
            {users.length === 1 ? "User" : "Users"}
          </span>
        </div>
      </div>

      {/* User Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <input
          value={userSearch}
          onChange={(event) =>
            setUserSearch(event.target.value)
          }
          placeholder="Search users by username or email..."
          className="h-11 w-full rounded-lg border bg-background pl-10 pr-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />

        {userSearch && (
          <button
            type="button"
            onClick={() => setUserSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Users */}
      <div className="space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="rounded-xl border bg-card p-10 text-center">
            <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />

            <h3 className="font-medium">
              No users found
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Try changing your search.
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => {
            const expanded = expandedUsers.has(user.id)
            const selected = getSelectedCategories(user)
            const changed = hasChanges(user)
            const isSaving = savingUserId === user.id

            return (
              <div
                key={user.id}
                className="overflow-hidden rounded-xl border bg-card"
              >
                {/* User Header */}
                <button
                  type="button"
                  onClick={() => toggleUser(user.id)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-muted/40"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">
                          {user.username}
                        </span>

                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                          {user.role}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span>
                          @{user.username}
                        </span>

                        <span>
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <span className="hidden text-sm text-muted-foreground sm:block">
                      {selected.length} / {categories.length}{" "}
                      categories
                    </span>

                    {expanded ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Access Panel */}
                {expanded && (
                  <div className="border-t">
                    {/* Toolbar */}
                    <div className="flex flex-col gap-3 border-b bg-muted/20 p-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="relative w-full lg:max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                        <input
                          value={categorySearch}
                          onChange={(event) =>
                            setCategorySearch(
                              event.target.value,
                            )
                          }
                          placeholder="Search categories..."
                          className="h-10 w-full rounded-lg border bg-background pl-10 pr-10 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />

                        {categorySearch && (
                          <button
                            type="button"
                            onClick={() =>
                              setCategorySearch("")
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => selectAll(user)}
                          className="rounded-lg border bg-background px-3 py-2 text-sm font-medium transition hover:bg-muted"
                        >
                          Select All
                        </button>

                        <button
                          type="button"
                          onClick={() => clearAll(user)}
                          className="rounded-lg border bg-background px-3 py-2 text-sm font-medium transition hover:bg-muted"
                        >
                          Clear All
                        </button>

                        <button
                          type="button"
                          onClick={() => saveAccess(user)}
                          disabled={
                            isSaving || !changed
                          }
                          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isSaving
                            ? "Saving..."
                            : "Save Access"}
                        </button>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-3">
                      <p className="text-sm text-muted-foreground">
                        Select the categories this user is
                        allowed to view.
                      </p>

                      <p className="text-sm font-medium">
                        {selected.length} selected
                      </p>
                    </div>

                    {/* Categories */}
                    <div className="p-5">
                      {filteredCategories.length === 0 ? (
                        <div className="rounded-lg border border-dashed p-8 text-center">
                          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                            <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                          </div>

                          <p className="mt-2 text-sm font-medium">
                            No categories found
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            Try a different category search.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                          {filteredCategories.map(
                            (category) => {
                              const checked =
                                selected.includes(
                                  category.id,
                                )

                              return (
                                <div
                                  key={category.id}
                                  className={`flex items-center gap-3 rounded-lg border p-3 transition ${
                                    checked
                                      ? "border-primary/40 bg-primary/5"
                                      : "hover:bg-muted/40"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() =>
                                      toggleCategory(
                                        user,
                                        category.id,
                                      )
                                    }
                                    aria-label={`Allow ${user.username} to access ${category.name}`}
                                    className="h-4 w-4 shrink-0 cursor-pointer accent-primary"
                                  />

                                  <button
                                    type="button"
                                    onClick={() =>
                                      toggleCategory(
                                        user,
                                        category.id,
                                      )
                                    }
                                    className="min-w-0 flex-1 cursor-pointer truncate text-left text-sm font-medium"
                                  >
                                    {category.name}
                                  </button>

                                  {checked && (
                                    <Check className="h-4 w-4 shrink-0 text-primary" />
                                  )}
                                </div>
                              )
                            },
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}