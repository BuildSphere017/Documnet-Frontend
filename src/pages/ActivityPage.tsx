import { useState } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Activity as ActivityIcon } from "lucide-react"
import { PageHeader } from "@/components/common/PageHeader"
import { EmptyState } from "@/components/common/EmptyState"
import { ActivityBadge } from "@/components/activity/ActivityBadge"
import { SegmentedControl } from "@/components/common/SegmentedControl"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { activityService } from "@/services/activity.service"
import { formatDate } from "@/lib/utils"
import type { ActivityAction } from "@/types"

const FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "UPLOAD", label: "Uploads" },
  { value: "DOWNLOAD", label: "Downloads" },
  { value: "SHARE", label: "Shares" },
  { value: "AI_SEARCH", label: "AI" },
  { value: "LOGIN", label: "Logins" },
]

export default function ActivityPage() {
  const [filter, setFilter] = useState("all")

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["activity", filter],
    queryFn: ({ pageParam }) =>
      activityService.list({ action: filter === "all" ? undefined : filter, cursor: pageParam, limit: 30 }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  })

  const items = data?.pages.flatMap((p) => p.items) ?? []

  return (
    <>
      <PageHeader title="Activity log" subtitle="Every upload, download, share, AI search and login." />

      <div className="mb-5 overflow-x-auto pb-1">
        <SegmentedControl value={filter} onChange={setFilter} segments={FILTERS} layoutId="activity-filter" />
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}</div>
      ) : items.length === 0 ? (
        <EmptyState icon={ActivityIcon} title="No activity yet" description="Actions will appear here as people use the system." />
      ) : (
        <div className="space-y-2.5">
          {items.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 10) * 0.02 }}>
              <Card className="flex items-center gap-3 p-3.5">
                <div className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-1.5 text-sm">
                    <span className="font-semibold">{a.actorName}</span>
                    <ActivityBadge action={a.action as ActivityAction} />
                    {a.targetTitle && <span className="truncate text-muted-foreground">· {a.targetTitle}</span>}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">{formatDate(a.createdAt)}</span>
              </Card>
            </motion.div>
          ))}
          {hasNextPage && (
            <div className="pt-2 text-center">
              <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                {isFetchingNextPage ? "Loading…" : "Load more"}
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
