import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Bell, CheckCheck, FileText, Share2, UserPlus, Info } from "lucide-react"
import { PageHeader } from "@/components/common/PageHeader"
import { EmptyState } from "@/components/common/EmptyState"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { notificationService } from "@/services/notification.service"
import { timeAgo, cn } from "@/lib/utils"

const iconFor = (type: string) =>
  type === "upload" ? FileText : type === "share" ? Share2 : type === "user" ? UserPlus : Info

export default function NotificationsPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ["notifications"], queryFn: notificationService.list })

  const markAll = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  })
  const markOne = useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  })

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="Updates about your documents and account."
        actions={data && data.unread > 0 ? (
          <Button variant="outline" onClick={() => markAll.mutate()}><CheckCheck className="h-4 w-4" /> Mark all read</Button>
        ) : undefined}
      />

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}</div>
      ) : !data?.items.length ? (
        <EmptyState icon={Bell} title="You're all caught up" description="New notifications will show up here." />
      ) : (
        <div className="space-y-2.5">
          {data.items.map((n, i) => {
            const Icon = iconFor(n.type)
            return (
              <motion.div key={n.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card
                  className={cn("flex items-start gap-3 p-4 transition-colors", !n.read && "border-primary/30 bg-primary/[0.03]")}
                  onClick={() => !n.read && markOne.mutate(n.id)}
                >
                  <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", n.read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary")}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{n.title}</p>
                    {n.body && <p className="text-sm text-muted-foreground">{n.body}</p>}
                    <p className="mt-0.5 text-xs text-muted-foreground/70">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </>
  )
}
