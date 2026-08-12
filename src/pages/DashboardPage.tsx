import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  FileText,
  Download,
  Upload,
  Sparkles,
  Eye,
  TrendingUp,
  Search as SearchIcon,
  Users,
  MoreVertical,
  ChevronDown,
  Activity as ActivityIcon,
  FolderPlus,
  BarChart3,
  ArrowUpRight,
} from "lucide-react"

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
} from "recharts"

import { useDashboard } from "@/hooks/useDashboard"
import { useAuth } from "@/context/AuthContext"
import { EmptyState } from "@/components/common/EmptyState"
import { ActivityBadge } from "@/components/activity/ActivityBadge"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatBytes, timeAgo, cn } from "@/lib/utils"


/* =========================================================
   DASHBOARD SKELETON
========================================================= */

function DashboardSkeleton() {
  return (
    <div className="min-w-0 space-y-5">

      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-[430px] max-w-full rounded-lg" />
        <Skeleton className="h-4 w-[330px] max-w-full rounded-lg" />
      </div>

      {/* KPI + Chart */}
      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-[180px] rounded-2xl"
            />
          ))}
        </div>

        <Skeleton className="h-[364px] rounded-2xl" />

      </div>

      {/* Lower Section */}
      <div className="grid gap-4 xl:grid-cols-[1.15fr_1.15fr_1fr]">
        <Skeleton className="h-[305px] rounded-2xl" />
        <Skeleton className="h-[305px] rounded-2xl" />
        <Skeleton className="h-[305px] rounded-2xl" />
      </div>

    </div>
  )
}


/* =========================================================
   GREETING
========================================================= */

function getGreeting() {
  const hour = new Date().getHours()

  if (hour < 12) {
    return "Good Morning"
  }

  if (hour < 17) {
    return "Good Afternoon"
  }

  return "Good Evening"
}


/* =========================================================
   KPI CARD
   Flowing Water Wave Design
========================================================= */

function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
  percentage,
}: {
  label: string
  value: number | string
  hint: string
  icon: typeof FileText
  tone: "blue" | "green" | "orange" | "red"
  percentage?: string
}) {

  const styles = {
    blue: {
      card:
        "border-blue-100/80 bg-gradient-to-br from-white via-blue-50/35 to-blue-50/75",
      icon:
        "bg-blue-100 text-blue-600 ring-1 ring-blue-200/50",
      label:
        "text-blue-700",
      wave:
        "#6D9BF7",
      waveLight:
        "#C9DBFF",
      arrow:
        "text-emerald-600",
    },

    green: {
      card:
        "border-emerald-100/80 bg-gradient-to-br from-white via-emerald-50/30 to-emerald-50/75",
      icon:
        "bg-emerald-100 text-emerald-600 ring-1 ring-emerald-200/50",
      label:
        "text-emerald-700",
      wave:
        "#62D3B0",
      waveLight:
        "#C8F1E3",
      arrow:
        "text-emerald-600",
    },

    orange: {
      card:
        "border-orange-100/80 bg-gradient-to-br from-white via-orange-50/30 to-orange-50/75",
      icon:
        "bg-orange-100 text-orange-600 ring-1 ring-orange-200/50",
      label:
        "text-orange-700",
      wave:
        "#F5B56F",
      waveLight:
        "#FFE0B8",
      arrow:
        "text-orange-600",
    },

    red: {
      card:
        "border-rose-100/80 bg-gradient-to-br from-white via-rose-50/30 to-rose-50/75",
      icon:
        "bg-rose-100 text-rose-600 ring-1 ring-rose-200/50",
      label:
        "text-rose-700",
      wave:
        "#F39AAA",
      waveLight:
        "#FFD3DB",
      arrow:
        "text-rose-600",
    },
  }

  const style = styles[tone]

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.25,
      }}
      className={cn(
        "group relative min-h-[180px] overflow-hidden rounded-2xl border",
        "p-5 sm:p-6",
        "shadow-[0_8px_25px_rgba(35,57,105,.07)]",
        "transition-all duration-300",
        "hover:-translate-y-1",
        "hover:shadow-[0_16px_35px_rgba(35,57,105,.12)]",
        style.card
      )}
    >

      {/* =====================================================
          FLOWING WATER WAVES
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          bottom-0
          right-0
          h-[108px]
          w-[72%]
        "
      >

        {/* Back soft wave */}

        <svg
          viewBox="0 0 600 160"
          preserveAspectRatio="none"
          className="
            absolute
            bottom-0
            right-0
            h-full
            w-full
            transition-transform
            duration-700
            group-hover:translate-x-2
          "
        >
          <path
            d="
              M0 160
              C55 155 95 142 140 125
              C190 106 225 115 270 105
              C320 94 340 54 395 48
              C450 42 490 60 535 38
              C560 26 580 12 600 0
              L600 160
              Z
            "
            fill={style.waveLight}
            opacity="0.78"
          />
        </svg>


        {/* Main water wave */}

        <svg
          viewBox="0 0 600 160"
          preserveAspectRatio="none"
          className="
            absolute
            bottom-0
            right-0
            h-full
            w-full
            transition-transform
            duration-500
            group-hover:translate-x-1
          "
        >
          <path
            d="
              M0 160
              C50 156 90 146 135 133
              C185 118 220 125 265 112
              C315 98 338 65 392 59
              C445 53 482 68 525 48
              C555 34 580 18 600 8
              L600 160
              Z
            "
            fill={style.wave}
            opacity="0.30"
          />
        </svg>


        {/* Front transparent water layer */}

        <svg
          viewBox="0 0 600 160"
          preserveAspectRatio="none"
          className="
            absolute
            bottom-0
            right-0
            h-full
            w-full
          "
        >
          <path
            d="
              M0 160
              C48 157 92 148 138 137
              C185 126 222 132 267 119
              C316 104 340 73 394 67
              C447 61 484 75 526 55
              C557 40 582 25 600 15
              L600 160
              Z
            "
            fill={style.wave}
            opacity="0.16"
          />
        </svg>


        {/* Subtle wave highlight */}

        <svg
          viewBox="0 0 600 160"
          preserveAspectRatio="none"
          className="
            absolute
            bottom-0
            right-0
            h-full
            w-full
          "
        >
          <path
            d="
              M0 160
              C50 156 90 146 135 133
              C185 118 220 125 265 112
              C315 98 338 65 392 59
              C445 53 482 68 525 48
              C555 34 580 18 600 8
            "
            fill="none"
            stroke={style.wave}
            strokeWidth="2"
            opacity="0.34"
          />
        </svg>

      </div>


      {/* =====================================================
          KPI CONTENT
      ====================================================== */}

      <div className="relative z-10">

        {/* Icon + Label */}

        <div className="flex items-start justify-between">

          {/* Icon */}

          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-xl",
              "shadow-sm",
              style.icon
            )}
          >
            <Icon
              className="h-7 w-7"
              strokeWidth={1.9}
            />
          </div>


          {/* Label */}

          <p
            className={cn(
              "pt-1 text-[11px] font-bold uppercase tracking-[0.06em]",
              style.label
            )}
          >
            {label}
          </p>

        </div>


        {/* Value */}

        <p
          className="
            mt-3
            font-display
            text-[2.35rem]
            font-semibold
            leading-none
            tracking-tight
            text-slate-900
          "
        >
          {value}
        </p>


        {/* Bottom information */}

        <div className="relative z-20 mt-5 flex items-center gap-2">

          <TrendingUp
            className={cn(
              "h-4 w-4",
              style.arrow
            )}
            strokeWidth={2.3}
          />

          {percentage && (
            <span
              className={cn(
                "text-xs font-semibold",
                tone === "orange" || tone === "red"
                  ? style.arrow
                  : "text-emerald-600"
              )}
            >
              {percentage}
            </span>
          )}

          <span
            className="
              text-[11px]
              font-medium
              text-slate-500
            "
          >
            {hint}
          </span>

        </div>

      </div>

    </motion.div>
  )
}


/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  icon: Icon,
  title,
  tone = "blue",
  action,
}: {
  icon: typeof FileText
  title: string
  tone?: "blue" | "purple" | "orange"
  action?: React.ReactNode
}) {

  const colors = {
    blue: {
      icon:
        "bg-blue-100 text-blue-600",
      text:
        "text-blue-700",
    },

    purple: {
      icon:
        "bg-violet-100 text-violet-600",
      text:
        "text-violet-700",
    },

    orange: {
      icon:
        "bg-orange-100 text-orange-600",
      text:
        "text-orange-700",
    },
  }

  const color = colors[tone]

  return (
    <CardHeader
      className="
        flex-row
        items-center
        justify-between
        space-y-0
        px-5
        pb-3
        pt-5
      "
    >

      <div className="flex items-center gap-2.5">

        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            color.icon
          )}
        >
          <Icon
            className="h-4 w-4"
            strokeWidth={2}
          />
        </div>

        <CardTitle
          className={cn(
            "text-[11px] font-bold uppercase tracking-[0.08em]",
            color.text
          )}
        >
          {title}
        </CardTitle>

      </div>

      {action}

    </CardHeader>
  )
}


/* =========================================================
   DASHBOARD
========================================================= */

export default function DashboardPage() {

  const { user, hasRole } = useAuth()

  const {
    data,
    isLoading,
  } = useDashboard()


  if (isLoading && !data) {
    return <DashboardSkeleton />
  }


  const {
    stats,
    storageTrend,
    recentUploads,
    recentActivity,
  } = data!


  const canSeeStats =
    hasRole("ADMIN", "MANAGER")

  const chartData =
    storageTrend ?? []


  return (
    <div className="min-w-0 space-y-5">


      {/* =====================================================
          HEADER
      ====================================================== */}

      <motion.section
        initial={{
          opacity: 0,
          y: -8,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.3,
        }}
        className="px-1"
      >

        <h1
          className="
            font-display
            text-[1.9rem]
            font-semibold
            leading-tight
            tracking-tight
            text-[#0b234e]
            sm:text-[2.15rem]
          "
        >
          {getGreeting()}, {user?.fullName || "there"}{" "}
          <span className="inline-block">
            👋
          </span>
        </h1>

        <p
          className="
            mt-1.5
            text-sm
            font-medium
            text-[#466084]
          "
        >
          Here's what's happening with your documents today.
        </p>

      </motion.section>


      {/* =====================================================
          KPI + DOCUMENT OVERVIEW
      ====================================================== */}

      {canSeeStats && (

        <div
          className="
            grid
            gap-4
            xl:grid-cols-[1.6fr_1fr]
          "
        >

          {/* =================================================
              KPI GRID
          ================================================== */}

          <div
            className="
              grid
              grid-cols-1
              gap-4
              sm:grid-cols-2
            "
          >

            <KpiCard
              label="Total documents"
              value={stats.totalDocuments}
              hint="from last month"
              percentage={`${stats.uploadsToday} uploaded today`}
              icon={FileText}
              tone="blue"
            />

            <KpiCard
              label="Active users"
              value={(stats as any).activeUsersToday ?? 0}
              hint="from last month"
              percentage={`${stats.totalUsers} total users`}
              icon={Users}
              tone="green"
            />

            <KpiCard
              label="Downloads"
              value={stats.downloadsToday}
              hint="from last month"
              percentage="0%"
              icon={Download}
              tone="orange"
            />

            <KpiCard
              label="AI searches"
              value={stats.aiSearchesToday}
              hint="from last month"
              percentage="0%"
              icon={SearchIcon}
              tone="red"
            />

          </div>


          {/* =================================================
              DOCUMENTS OVERVIEW
          ================================================== */}

          <Card
            className="
              dashboard-overview-card
              overflow-hidden
              rounded-2xl
              border
            "
          >

            <SectionHeader
              icon={FileText}
              title="Documents Overview"
              tone="blue"
              action={
                <Button
                  variant="outline"
                  size="sm"
                  className="
                    h-8
                    gap-1
                    rounded-lg
                    border-slate-200
                    bg-white/75
                    px-2.5
                    text-[11px]
                    font-medium
                    shadow-none
                  "
                >
                  Last 30 days
                  <ChevronDown className="h-3 w-3" />
                </Button>
              }
            />


            <CardContent
              className="
                px-4
                pb-4
                pt-1
              "
            >

              <div className="h-[270px] w-full">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <AreaChart
                    data={chartData}
                    margin={{
                      left: 4,
                      right: 4,
                      top: 8,
                      bottom: 0,
                    }}
                  >

                    <defs>

                      <linearGradient
                        id="dashboardBlueArea"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >

                        <stop
                          offset="0%"
                          stopColor="#4d7df0"
                          stopOpacity={0.30}
                        />

                        <stop
                          offset="100%"
                          stopColor="#4d7df0"
                          stopOpacity={0.035}
                        />

                      </linearGradient>

                    </defs>


                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tick={{
                        fontSize: 10,
                        fill: "#526784",
                      }}
                    />


                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{
                        fontSize: 10,
                        fill: "#526784",
                      }}
                      tickFormatter={(v) =>
                        formatBytes(v, 0)
                      }
                      width={45}
                    />


                    <RTooltip
                      cursor={{
                        stroke: "#b7c5dc",
                        strokeDasharray: "4 4",
                      }}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #dce4f0",
                        background: "rgba(255,255,255,.97)",
                        fontSize: 11,
                        boxShadow:
                          "0 10px 25px rgba(15,23,42,.10)",
                      }}
                      formatter={(v: number) => [
                        formatBytes(v),
                        "Storage",
                      ]}
                    />


                    <Area
                      type="monotone"
                      dataKey="bytes"
                      stroke="#2161dd"
                      strokeWidth={2.5}
                      fill="url(#dashboardBlueArea)"
                      dot={{
                        r: 3,
                        fill: "#2161dd",
                        strokeWidth: 0,
                      }}
                      activeDot={{
                        r: 4.5,
                      }}
                    />

                  </AreaChart>

                </ResponsiveContainer>

              </div>

            </CardContent>

          </Card>

        </div>

      )}


      {/* =====================================================
          NON ADMIN / MANAGER
      ====================================================== */}

      {!canSeeStats && (

        <Card
          className="
            dashboard-overview-card
            overflow-hidden
            rounded-2xl
          "
        >

          <CardHeader className="px-5 pb-3 pt-5">

            <CardTitle
              className="
                text-[11px]
                font-bold
                uppercase
                tracking-[0.08em]
                text-blue-700
              "
            >
              Find a document
            </CardTitle>

          </CardHeader>


          <CardContent className="px-5 pb-5">

            <Link
              to="/documents"
              className="
                flex
                h-12
                items-center
                gap-2
                rounded-xl
                border
                border-blue-100
                bg-blue-50/70
                px-4
                text-xs
                font-medium
                text-slate-600
                transition-all
                hover:bg-blue-100
              "
            >

              <SearchIcon
                className="
                  h-4
                  w-4
                  text-blue-600
                "
              />

              Search your document library…

            </Link>

          </CardContent>

        </Card>

      )}


      {/* =====================================================
          THREE COLUMN LOWER SECTION
      ====================================================== */}

      <div
        className="
          grid
          gap-4
          xl:grid-cols-[1.15fr_1.15fr_1fr]
        "
      >


        {/* ===================================================
            RECENT ACTIVITY
        ==================================================== */}

        <Card
          className="
            dashboard-activity-card
            overflow-hidden
            rounded-2xl
            border
          "
        >

          <SectionHeader
            icon={ActivityIcon}
            title="Recent Activity"
            tone="purple"
            action={
              canSeeStats && (
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="
                    h-8
                    rounded-lg
                    px-2
                    text-[11px]
                    font-medium
                    text-violet-700
                    hover:bg-violet-100/70
                  "
                >
                  <Link to="/activity">
                    View all
                  </Link>
                </Button>
              )
            }
          />


          <CardContent className="px-5 pb-5">

            {recentActivity.length === 0 ? (

              <EmptyState
                icon={Eye}
                title="No activity yet"
              />

            ) : (

              <div className="space-y-1">

                {recentActivity
                  .slice(0, 5)
                  .map((a) => (

                    <div
                      key={a.id}
                      className="
                        group
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        px-1
                        py-3
                        transition-colors
                        hover:bg-white/50
                      "
                    >

                      {/* Activity icon */}

                      <div
                        className="
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          bg-violet-100
                          text-violet-600
                        "
                      >

                        <ActivityIcon
                          className="h-4 w-4"
                        />

                      </div>


                      {/* Activity information */}

                      <div className="min-w-0 flex-1">

                        <p
                          className="
                            truncate
                            text-xs
                            font-semibold
                            text-slate-800
                          "
                        >

                          {a.actorName}

                          <span className="ml-2">
                            <ActivityBadge
                              action={a.action}
                            />
                          </span>

                        </p>


                        <p
                          className="
                            mt-1
                            truncate
                            text-[10px]
                            text-slate-500
                          "
                        >
                          {a.targetTitle ??
                            "Logged in to the system"}
                        </p>

                      </div>


                      {/* Time */}

                      <span
                        className="
                          shrink-0
                          text-[10px]
                          font-medium
                          text-slate-400
                        "
                      >
                        {timeAgo(a.createdAt)}
                      </span>

                    </div>

                  ))}

              </div>

            )}

          </CardContent>

        </Card>


        {/* ===================================================
            RECENT DOCUMENTS
        ==================================================== */}

        <Card
          className="
            dashboard-documents-card
            overflow-hidden
            rounded-2xl
            border
          "
        >

          <SectionHeader
            icon={FileText}
            title="Recent Documents"
            tone="blue"
            action={
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="
                  h-8
                  rounded-lg
                  px-2
                  text-[11px]
                  font-medium
                  text-blue-700
                  hover:bg-blue-100/70
                "
              >
                <Link to="/documents">
                  View all
                </Link>
              </Button>
            }
          />


          <CardContent className="px-5 pb-5">

            {recentUploads.length === 0 ? (

              <EmptyState
                icon={Upload}
                title="No uploads yet"
                description="Upload your first document to get started."
              />

            ) : (

              <div className="space-y-1">

                {recentUploads
                  .slice(0, 5)
                  .map((doc, index) => {

                    const iconStyles = [
                      "bg-blue-100 text-blue-600",
                      "bg-rose-100 text-rose-600",
                      "bg-emerald-100 text-emerald-600",
                      "bg-orange-100 text-orange-600",
                      "bg-violet-100 text-violet-600",
                    ]

                    return (
                      <div
                        key={doc.id}
                        className="
                          group
                          flex
                          items-center
                          gap-3
                          rounded-xl
                          px-1
                          py-3
                          transition-colors
                          hover:bg-white/50
                        "
                      >

                        <div
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                            iconStyles[
                              index % iconStyles.length
                            ]
                          )}
                        >
                          <FileText
                            className="h-4 w-4"
                          />
                        </div>


                        <div className="min-w-0 flex-1">

                          <p
                            className="
                              truncate
                              text-xs
                              font-semibold
                              text-slate-800
                            "
                          >
                            {doc.title}
                          </p>


                          <p
                            className="
                              mt-1
                              truncate
                              text-[10px]
                              text-slate-500
                            "
                          >
                            Category:{" "}
                            {doc.category?.name ??
                              "Uncategorized"}{" "}
                            ·{" "}
                            {formatBytes(doc.size)}
                          </p>

                        </div>


                        <span
                          className="
                            shrink-0
                            text-[10px]
                            font-medium
                            text-slate-400
                          "
                        >
                          {timeAgo(doc.createdAt)}
                        </span>


                        <MoreVertical
                          className="
                            h-4
                            w-4
                            shrink-0
                            text-slate-400
                            opacity-0
                            transition-opacity
                            group-hover:opacity-100
                          "
                        />

                      </div>
                    )
                  })}

              </div>

            )}

          </CardContent>

        </Card>


        {/* ===================================================
            QUICK ACTIONS
        ==================================================== */}

        {canSeeStats && (

          <Card
            className="
              dashboard-actions-card
              overflow-hidden
              rounded-2xl
              border
            "
          >

            <SectionHeader
              icon={Sparkles}
              title="Quick Actions"
              tone="orange"
            />


            <CardContent className="space-y-2 px-5 pb-5">


              {/* Upload */}

              {hasRole("ADMIN") && (

                <Link
                  to="/documents"
                  className="
                    dashboard-action-blue
                    group
                    flex
                    min-h-[54px]
                    items-center
                    gap-3
                    rounded-xl
                    border
                    px-3
                    py-2
                    transition-all
                    hover:-translate-y-0.5
                  "
                >

                  <div
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      bg-blue-100
                      text-blue-600
                    "
                  >
                    <Upload className="h-4 w-4" />
                  </div>


                  <div className="min-w-0 flex-1">

                    <p
                      className="
                        text-xs
                        font-semibold
                        text-blue-800
                      "
                    >
                      Upload Document
                    </p>

                    <p
                      className="
                        mt-0.5
                        text-[10px]
                        text-slate-500
                      "
                    >
                      Upload new documents
                    </p>

                  </div>


                  <ArrowUpRight
                    className="
                      h-4
                      w-4
                      text-blue-600
                      transition-transform
                      group-hover:translate-x-0.5
                    "
                  />

                </Link>

              )}


              {/* Add Category */}

              <Link
                to="/categories"
                className="
                  dashboard-action-orange
                  group
                  flex
                  min-h-[54px]
                  items-center
                  gap-3
                  rounded-xl
                  border
                  px-3
                  py-2
                  transition-all
                  hover:-translate-y-0.5
                "
              >

                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-orange-100
                    text-orange-600
                  "
                >
                  <FolderPlus className="h-4 w-4" />
                </div>


                <div className="min-w-0 flex-1">

                  <p
                    className="
                      text-xs
                      font-semibold
                      text-orange-800
                    "
                  >
                    Add Category
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-[10px]
                      text-slate-500
                    "
                  >
                    Create a new category
                  </p>

                </div>


                <ArrowUpRight
                  className="
                    h-4
                    w-4
                    text-orange-600
                    transition-transform
                    group-hover:translate-x-0.5
                  "
                />

              </Link>


              {/* AI */}

              <Link
                to="/ai-search"
                className="
                  dashboard-action-purple
                  group
                  flex
                  min-h-[54px]
                  items-center
                  gap-3
                  rounded-xl
                  border
                  px-3
                  py-2
                  transition-all
                  hover:-translate-y-0.5
                "
              >

                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-violet-100
                    text-violet-600
                  "
                >
                  <Sparkles className="h-4 w-4" />
                </div>


                <div className="min-w-0 flex-1">

                  <p
                    className="
                      text-xs
                      font-semibold
                      text-violet-800
                    "
                  >
                    Ask AI
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-[10px]
                      text-slate-500
                    "
                  >
                    Search with AI assistant
                  </p>

                </div>


                <ArrowUpRight
                  className="
                    h-4
                    w-4
                    text-violet-600
                    transition-transform
                    group-hover:translate-x-0.5
                  "
                />

              </Link>


              {/* Reports */}

              <Link
                to="/activity"
                className="
                  dashboard-action-red
                  group
                  flex
                  min-h-[54px]
                  items-center
                  gap-3
                  rounded-xl
                  border
                  px-3
                  py-2
                  transition-all
                  hover:-translate-y-0.5
                "
              >

                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-rose-100
                    text-rose-600
                  "
                >
                  <BarChart3 className="h-4 w-4" />
                </div>


                <div className="min-w-0 flex-1">

                  <p
                    className="
                      text-xs
                      font-semibold
                      text-rose-800
                    "
                  >
                    View Reports
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-[10px]
                      text-slate-500
                    "
                  >
                    Analytics and insights
                  </p>

                </div>


                <ArrowUpRight
                  className="
                    h-4
                    w-4
                    text-rose-600
                    transition-transform
                    group-hover:translate-x-0.5
                  "
                />

              </Link>

            </CardContent>

          </Card>

        )}

      </div>

    </div>
  )
}