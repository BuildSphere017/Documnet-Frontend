# MAKPHALT DMS — Frontend

Enterprise AI-powered Document Management System. Premium SaaS UI built with a modern
React stack. This is the **frontend foundation**: design system, app shell, auth, and a
fully-built Dashboard. The remaining modules (Documents, Categories, Users, Activity,
AI Search, Screenshot Search, Chat-with-Documents, Analytics, Settings) are scaffolded
as routed pages and are filled in following the build order.

## Tech stack
- React 18 + Vite + TypeScript
- Tailwind CSS + shadcn/ui (New York) + Framer Motion
- React Router (code-split, lazy routes) + TanStack Query
- React Hook Form + Zod
- Recharts, Lucide icons, Sonner (toasts), cmdk (command palette)

## Getting started
```bash
npm install
cp .env .env.local          # optional; edit VITE_API_URL to point at your backend
npm run dev                 # http://localhost:5173
```
Set the API base URL in `.env`:
```
VITE_API_URL=http://localhost:4000/api
```

## Scripts
- `npm run dev` — start the dev server
- `npm run build` — typecheck + production build
- `npm run preview` — preview the production build

## Design system
- Primary `#2563EB`, Accent/flame `#F97316`, Background `#F8FAFC`
- Inter font, rounded-2xl cards, soft shadows, glassmorphic topbar
- Full light/dark/system theme support (`ThemeProvider`), toggle in the topbar
- Design tokens live as CSS variables in `src/index.css` and are mapped in `tailwind.config.js`

## Structure
```
src/
  assets/       logo.png
  components/
    ui/         shadcn primitives
    common/     Logo, PageHeader, StatCard, EmptyState, ThemeToggle, ...
    layout/     Sidebar, Topbar, CommandPalette, AIAssistant, AppLayout
    activity/   ActivityBadge
  config/       nav.tsx (role-aware navigation)
  context/      AuthContext, ThemeProvider
  hooks/        useDebounce, useDashboard
  lib/          api (axios + JWT interceptors), queryClient, utils
  pages/        DashboardPage + auth/LoginPage + module pages
  routes/       ProtectedRoute (role-based guards)
  services/     auth.service, dashboard.service
  types/        shared TS types
```

## Auth & RBAC
- JWT stored in `localStorage`, attached via axios request interceptor
- 401 responses auto-redirect to `/login`
- `ProtectedRoute` guards routes; role-restricted routes: Categories/Analytics/Activity
  (ADMIN, MANAGER), Users (ADMIN only)
- Roles: `ADMIN`, `MANAGER`, `SALES`

## Expected backend endpoints (built next)
- `POST /api/auth/login` → `{ accessToken, user }`
- `GET  /api/auth/me` → `User`
- `POST /api/auth/logout`
- `GET  /api/dashboard/overview` → `DashboardOverview`

The backend (Node + Express + Prisma + PostgreSQL/pgvector + Supabase Storage +
Ollama/Gemini/OpenAI) is delivered next in the build order.

## Keyboard shortcuts
- `⌘K` / `Ctrl+K` — command palette
