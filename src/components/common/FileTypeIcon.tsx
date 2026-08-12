import {
  FileText, FileSpreadsheet, FileImage, FileVideo, FileArchive,
  Presentation, File, type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { FileKind } from "@/types"

const MAP: Record<FileKind, { icon: LucideIcon; className: string }> = {
  PDF:   { icon: FileText,        className: "bg-red-500/10 text-red-500" },
  DOCX:  { icon: FileText,        className: "bg-blue-500/10 text-blue-500" },
  PPT:   { icon: Presentation,    className: "bg-orange-500/10 text-orange-500" },
  XLSX:  { icon: FileSpreadsheet, className: "bg-emerald-500/10 text-emerald-500" },
  IMAGE: { icon: FileImage,       className: "bg-violet-500/10 text-violet-500" },
  VIDEO: { icon: FileVideo,       className: "bg-pink-500/10 text-pink-500" },
  ZIP:   { icon: FileArchive,     className: "bg-amber-500/10 text-amber-500" },
  OTHER: { icon: File,            className: "bg-muted text-muted-foreground" },
}

export function FileTypeIcon({ type, className }: { type: FileKind; className?: string }) {
  const { icon: Icon, className: color } = MAP[type] ?? MAP.OTHER
  return (
    <div className={cn("flex items-center justify-center rounded-xl", color, className)}>
      <Icon className="h-1/2 w-1/2" />
    </div>
  )
}
