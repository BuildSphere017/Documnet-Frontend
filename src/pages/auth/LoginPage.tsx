import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate, useLocation, Navigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Loader2, Eye, EyeOff, ArrowRight, Sparkles, ScanSearch, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import logo from "@/assets/logo.png"

const schema = z.object({
  username: z.string().min(1, "Enter your username"),
  password: z.string().min(1, "Enter your password"),
})
type FormValues = z.infer<typeof schema>

const capabilities = [
  { icon: Sparkles, title: "Answers, not just files", desc: "Ask in plain language and get replies cited to the exact page." },
  { icon: ScanSearch, title: "Find it any way you have it", desc: "Search by meaning, keyword, or a screenshot of a filename." },
  { icon: ShieldCheck, title: "Access you control", desc: "Per-category permissions with a complete audit trail." },
]

export default function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPw, setShowPw] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema) })

  if (user) return <Navigate to="/" replace />

  const onSubmit = async (values: FormValues) => {
    try {
      await login(values.username, values.password)
      const to = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/"
      toast.success("Signed in")
      navigate(to, { replace: true })
    } catch (err: any) {
      if (err?.response) {
        // Server responded (e.g. 401 wrong password, 403 disabled)
        toast.error(err.response.data?.message ?? "That username or password didn't match")
      } else {
        // No response = backend unreachable (wrong API URL, backend not running, IP changed)
        toast.error("Can't reach the server. Check that the backend is running and VITE_API_URL is correct.")
      }
    }
  }

  return (
    <div className="grid min-h-screen bg-[#f7f9fc] lg:grid-cols-[1.05fr_.95fr]">
      {/* ── Brand panel ─────────────────────────────────────────── */}
      <div className="relative hidden overflow-hidden bg-[#0b1220] lg:flex lg:flex-col lg:justify-between lg:p-12">

        {/* logo (image) */}
        <div className="relative flex items-center">
          <img src={logo} alt="MAKPHALT DMS" className="h-11 w-auto" />
        </div>

        {/* thesis */}
        <div className="relative max-w-lg space-y-8">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/70">
              <span className="h-1.5 w-1.5 rounded-full bg-flame" />
              35+ years of engineers' trust
            </div>
            <h1 className="font-display text-[2.5rem] font-semibold leading-[1.08] tracking-tight text-white">
              Every document,<br />
              <span className="text-white/70">intelligent and searchable.</span>
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/55">
              The document workspace for the MAKPHALT sales team — with grounded AI search,
              OCR, and answers you can trace back to the source.
            </p>
          </div>

          <div className="space-y-1">
            {capabilities.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="group flex items-start gap-4 rounded-xl px-2 py-3 transition-colors hover:bg-white/[0.04]"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition-colors group-hover:border-primary/40 group-hover:text-primary">
                  <c.icon className="h-[18px] w-[18px]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{c.title}</p>
                  <p className="text-sm leading-snug text-white/50">{c.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        
      </div>

      {/* ── Form panel ──────────────────────────────────────────── */}
      <div className="relative flex items-center justify-center border-l border-border bg-white px-6 py-12 text-foreground">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[22rem]"
        >
          {/* mobile logo (image) */}
          <div className="mb-10 lg:hidden">
            <img src={logo} alt="MAKPHALT DMS" className="h-10 w-auto" />
          </div>

          <div className="mb-8">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">Welcome back</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">Sign in to your document workspace.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-foreground/80">Username</Label>
              <Input id="username" autoComplete="username" placeholder="e.g. rishabh" className="h-11 border-border bg-white placeholder:text-muted-foreground/60 focus-visible:ring-primary/30" {...register("username")} />
              {errors.username && <p className="text-xs font-medium text-destructive">{errors.username.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-foreground/80">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="h-11 pr-11 border-border bg-white placeholder:text-muted-foreground/60 focus-visible:ring-primary/30"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs font-medium text-destructive">{errors.password.message}</p>}
            </div>

            <Button type="submit" size="lg" disabled={isSubmitting} className="group mt-2 h-11 w-full shadow-sm">
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>Sign in <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>
              )}
            </Button>
          </form>

        </motion.div>
      </div>
    </div>
  )
}