import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQuery, useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { Loader2, User, Lock, Cpu, Sun, Moon, Monitor, Check } from "lucide-react"
import { PageHeader } from "@/components/common/PageHeader"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { settingsService } from "@/services/settings.service"
import { useTheme } from "@/context/ThemeProvider"
import { cn } from "@/lib/utils"

const profileSchema = z.object({
  fullName: z.string().min(2, "Enter your name"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  department: z.string().optional(),
})
const pwSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password"),
  newPassword: z.string().min(8, "At least 8 characters"),
})

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" subtitle="Manage your profile, security, appearance and system." />
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile"><User className="h-4 w-4" /> Profile</TabsTrigger>
          <TabsTrigger value="security"><Lock className="h-4 w-4" /> Security</TabsTrigger>
          <TabsTrigger value="appearance"><Sun className="h-4 w-4" /> Appearance</TabsTrigger>
          <TabsTrigger value="system"><Cpu className="h-4 w-4" /> System</TabsTrigger>
        </TabsList>
        <TabsContent value="profile"><ProfileTab /></TabsContent>
        <TabsContent value="security"><SecurityTab /></TabsContent>
        <TabsContent value="appearance"><AppearanceTab /></TabsContent>
        <TabsContent value="system"><SystemTab /></TabsContent>
      </Tabs>
    </>
  )
}

function ProfileTab() {
  const { data, isLoading } = useQuery({ queryKey: ["profile"], queryFn: settingsService.profile })
  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof profileSchema>>({ resolver: zodResolver(profileSchema) })
  useEffect(() => { if (data) reset({ fullName: data.fullName, email: data.email ?? "", department: data.department ?? "" }) }, [data, reset])

  const save = useMutation({
    mutationFn: (v: z.infer<typeof profileSchema>) => settingsService.updateProfile({ ...v, email: v.email || undefined }),
    onSuccess: () => toast.success("Profile updated"),
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Couldn't update"),
  })

  if (isLoading) return <Skeleton className="h-72 rounded-2xl" />

  return (
    <Card className="max-w-2xl shadow-card">
      <CardHeader><CardTitle className="text-base">Your profile</CardTitle><CardDescription>Username <span className="font-medium text-foreground">{data?.username}</span> · role <Badge variant="muted">{data?.role}</Badge></CardDescription></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4">
          <div className="space-y-1.5"><Label>Full name</Label><Input {...register("fullName")} />{errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}</div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" {...register("email")} />{errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}</div>
            <div className="space-y-1.5"><Label>Department</Label><Input {...register("department")} /></div>
          </div>
          <Button type="submit" disabled={save.isPending}>{save.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save changes</Button>
        </form>
      </CardContent>
    </Card>
  )
}

function SecurityTab() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof pwSchema>>({ resolver: zodResolver(pwSchema) })
  const change = useMutation({
    mutationFn: (v: z.infer<typeof pwSchema>) => settingsService.changePassword(v.currentPassword, v.newPassword),
    onSuccess: () => { toast.success("Password changed"); reset() },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Couldn't change password"),
  })
  return (
    <Card className="max-w-2xl shadow-card">
      <CardHeader><CardTitle className="text-base">Change password</CardTitle><CardDescription>Use at least 8 characters.</CardDescription></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((v) => change.mutate(v))} className="space-y-4">
          <div className="space-y-1.5"><Label>Current password</Label><Input type="password" {...register("currentPassword")} />{errors.currentPassword && <p className="text-xs text-destructive">{errors.currentPassword.message}</p>}</div>
          <div className="space-y-1.5"><Label>New password</Label><Input type="password" {...register("newPassword")} />{errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword.message}</p>}</div>
          <Button type="submit" disabled={change.isPending}>{change.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Update password</Button>
        </form>
      </CardContent>
    </Card>
  )
}

function AppearanceTab() {
  const { theme, setTheme } = useTheme()
  const options = [
    { key: "light" as const, label: "Light", icon: Sun },
    { key: "dark" as const, label: "Dark", icon: Moon },
    { key: "system" as const, label: "System", icon: Monitor },
  ]
  return (
    <Card className="max-w-2xl shadow-card">
      <CardHeader><CardTitle className="text-base">Appearance</CardTitle><CardDescription>Choose how the app looks.</CardDescription></CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {options.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTheme(key)}
              className={cn("relative flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors", theme === key ? "border-primary bg-primary/5" : "border-border hover:bg-muted")}>
              {theme === key && <Check className="absolute right-2 top-2 h-4 w-4 text-primary" />}
              <Icon className="h-6 w-6" /><span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function SystemTab() {
  const { data, isLoading } = useQuery({ queryKey: ["system"], queryFn: settingsService.system })
  if (isLoading) return <Skeleton className="h-56 rounded-2xl" />
  const rows = [
    { label: "AI provider", value: data?.aiProvider, badge: true },
    { label: "Storage bucket", value: data?.storageBucket },
    { label: "Storage configured", value: data?.storageConfigured ? "Yes" : "No" },
    { label: "Max upload size", value: `${data?.maxFileSizeMb} MB` },
  ]
  return (
    <Card className="max-w-2xl shadow-card">
      <CardHeader><CardTitle className="text-base">System</CardTitle><CardDescription>Read-only configuration (set in the server .env).</CardDescription></CardHeader>
      <CardContent>
        <div className="divide-y divide-border">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between py-3 text-sm">
              <span className="text-muted-foreground">{r.label}</span>
              {r.badge ? <Badge variant="flame" className="uppercase">{r.value}</Badge> : <span className="font-medium">{r.value}</span>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
