import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip as RTooltip, PieChart, Pie, Cell, CartesianGrid,
} from "recharts"
import { FileText, Download, Sparkles, HardDrive, Eye, TrendingDown, Users as UsersIcon } from "lucide-react"
import { PageHeader } from "@/components/common/PageHeader"
import { StatCard } from "@/components/common/StatCard"
import { EmptyState } from "@/components/common/EmptyState"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { analyticsService } from "@/services/analytics.service"
import { formatBytes, formatDate } from "@/lib/utils"

const tooltipStyle = { borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["analytics"], queryFn: analyticsService.overview })

  if (isLoading || !data) {
    return (
      <>
        <PageHeader title="Analytics" subtitle="Usage, storage and engagement insights." />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-80 rounded-2xl lg:col-span-2" /><Skeleton className="h-80 rounded-2xl" />
        </div>
      </>
    )
  }

  const { totals, mostViewed, mostDownloaded, categoryUsage, activityTrend, inactive, topContributors } = data

  return (
    <>
      <PageHeader title="Analytics" subtitle="Usage, storage and engagement insights." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard index={0} label="Documents" value={totals.documents} icon={FileText} accent="primary" />
        <StatCard index={1} label="Storage used" value={formatBytes(totals.storageUsed)} icon={HardDrive} accent="violet" />
        <StatCard index={2} label="Downloads (30d)" value={totals.downloads30d} icon={Download} accent="emerald" />
        <StatCard index={3} label="AI searches (30d)" value={totals.aiSearches30d} icon={Sparkles} accent="flame" />
      </div>

      {/* Activity trend + category usage */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="shadow-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Activity — last 14 days</CardTitle>
            <CardDescription>Uploads, downloads and AI searches per day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityTrend} margin={{ left: -20, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/></linearGradient>
                    <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--flame))" stopOpacity={0.3}/><stop offset="95%" stopColor="hsl(var(--flame))" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                  <RTooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="downloads" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#gD)" name="Downloads" />
                  <Area type="monotone" dataKey="ai" stroke="hsl(var(--flame))" strokeWidth={2} fill="url(#gA)" name="AI searches" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base">Category usage</CardTitle><CardDescription>Documents per category</CardDescription></CardHeader>
          <CardContent>
            {categoryUsage.length === 0 ? <EmptyState icon={FileText} title="No data yet" /> : (
              <>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryUsage} dataKey="value" nameKey="name" innerRadius={42} outerRadius={68} paddingAngle={3} stroke="none">
                        {categoryUsage.map((c, i) => <Cell key={i} fill={c.color} />)}
                      </Pie>
                      <RTooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 space-y-1.5">
                  {categoryUsage.slice(0, 5).map((c) => (
                    <div key={c.name} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground"><span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />{c.name}</span>
                      <span className="font-medium tabular-nums">{c.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Most viewed + downloaded */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <RankCard title="Most viewed" icon={Eye} items={mostViewed} unit="views" />
        <RankCard title="Most downloaded" icon={Download} items={mostDownloaded} unit="downloads" />
      </div>

      {/* Contributors + inactive */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base">Top contributors</CardTitle><CardDescription>Documents uploaded per user</CardDescription></CardHeader>
          <CardContent>
            {topContributors.length === 0 ? <EmptyState icon={UsersIcon} title="No uploads yet" /> : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topContributors} layout="vertical" margin={{ left: 8, right: 16 }}>
                    <XAxis type="number" hide allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={110} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                    <RTooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted))" }} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} barSize={18} name="Uploads" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base">Inactive documents</CardTitle><CardDescription>Never viewed or downloaded</CardDescription></CardHeader>
          <CardContent>
            {inactive.length === 0 ? (
              <EmptyState icon={TrendingDown} title="Nothing inactive" description="Every document has been used." />
            ) : (
              <div className="divide-y divide-border">
                {inactive.map((d) => (
                  <div key={d.id} className="flex items-center gap-3 py-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground"><FileText className="h-4 w-4" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{d.title}</p>
                      <p className="text-xs text-muted-foreground">{d.category ?? "Uncategorized"} · added {formatDate(d.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function RankCard({ title, icon: Icon, items, unit }: { title: string; icon: any; items: { id: string; title: string; count: number; category?: string }[]; unit: string }) {
  return (
    <Card className="shadow-card">
      <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Icon className="h-4 w-4 text-primary" /> {title}</CardTitle></CardHeader>
      <CardContent>
        {items.length === 0 || items.every((i) => i.count === 0) ? (
          <EmptyState icon={Icon} title="No data yet" />
        ) : (
          <div className="space-y-2">
            {items.filter((i) => i.count > 0).map((d, idx) => (
              <motion.div key={d.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.04 }}
                className="flex items-center gap-3 rounded-xl border border-border p-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-sm font-bold text-muted-foreground">{idx + 1}</span>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{d.title}</p>{d.category && <p className="text-xs text-muted-foreground">{d.category}</p>}</div>
                <Badge variant="muted" className="tabular-nums">{d.count} {unit}</Badge>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
