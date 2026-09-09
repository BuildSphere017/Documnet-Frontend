import { lazy, Suspense } from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { AppLayout } from "@/components/layout/AppLayout"
import { ProtectedRoute } from "@/routes/ProtectedRoute"
import { LoadingScreen } from "@/components/common/LoadingScreen"

const LoginPage          = lazy(() => import("@/pages/auth/LoginPage"))
const DashboardPage      = lazy(() => import("@/pages/DashboardPage"))
const DocumentsPage      = lazy(() => import("@/pages/DocumentsPage"))
const FoldersPage        = lazy(() => import("@/pages/FoldersPage"))
const AISearchPage       = lazy(() => import("@/pages/AISearchPage"))
const CategoriesPage     = lazy(() => import("@/pages/CategoriesPage"))
const UsersPage          = lazy(() => import("@/pages/UsersPage"))
const CategoryAccessPage = lazy(() => import("@/pages/CategoryAccessPage"))
const AnalyticsPage      = lazy(() => import("@/pages/AnalyticsPage"))
const ActivityPage       = lazy(() => import("@/pages/ActivityPage"))
const NotificationsPage  = lazy(() => import("@/pages/NotificationsPage"))
const SettingsPage       = lazy(() => import("@/pages/SettingsPage"))
const FavoritesPage      = lazy(() => import("@/pages/FavoritesPage"))
const ExportPage         = lazy(() => import("@/pages/ExportPage"))
const DepartmentsPage    = lazy(() => import("@/pages/DepartmentsPage"))
const NotFoundPage       = lazy(() => import("@/pages/NotFoundPage"))

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>

              <Route path="/" element={<DashboardPage />} />

              <Route path="/documents" element={<DocumentsPage />} />

              <Route path="/folders" element={<FoldersPage />} />

              <Route path="/ai-search" element={<AISearchPage />} />

              <Route path="/notifications" element={<NotificationsPage />} />

              <Route path="/favorites" element={<FavoritesPage />} />

              <Route path="/export" element={<ExportPage />} />

              <Route path="/settings" element={<SettingsPage />} />

              <Route element={<ProtectedRoute roles={["ADMIN", "MANAGER"]} />}>
                <Route
                  path="/categories"
                  element={<CategoriesPage />}
                />

                <Route
                  path="/analytics"
                  element={<AnalyticsPage />}
                />

                <Route
                  path="/activity"
                  element={<ActivityPage />}
                />
              </Route>

              <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
                <Route
                  path="/users"
                  element={<UsersPage />}
                />

                <Route
                  path="/category-access"
                  element={<CategoryAccessPage />}
                />

                <Route
                  path="/departments"
                  element={<DepartmentsPage />}
                />
              </Route>

            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}