import {
  LayoutDashboard, FileText, FolderTree, Users, Activity,
  BarChart3, Sparkles, Bell, Settings, Star, Download, Building2, type LucideIcon,
} from "lucide-react"
import type { Role } from "@/types"

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  roles?: Role[]
}

export const navItems: NavItem[] = [
  { label: "Dashboard",     to: "/",              icon: LayoutDashboard },
  { label: "Documents",     to: "/documents",     icon: FileText },
  { label: "AI Search",     to: "/ai-search",     icon: Sparkles },
  { label: "Categories",    to: "/categories",    icon: FolderTree, roles: ["ADMIN", "MANAGER"] },
  { label: "Users",         to: "/users",         icon: Users,      roles: ["ADMIN"] },
  { label: "Departments",   to: "/departments",   icon: Building2,  roles: ["ADMIN"] },
  { label: "Analytics",     to: "/analytics",     icon: BarChart3,  roles: ["ADMIN", "MANAGER"] },
  { label: "Activity",      to: "/activity",      icon: Activity,   roles: ["ADMIN", "MANAGER"] },
  { label: "Favorites",     to: "/favorites",     icon: Star },
  { label: "Notifications", to: "/notifications", icon: Bell,      roles: ["ADMIN", "MANAGER"] },
  { label: "Export",        to: "/export",        icon: Download,  roles: ["ADMIN", "MANAGER"] },
  { label: "Settings",      to: "/settings",      icon: Settings,  roles: ["ADMIN", "MANAGER"] },
]
