import { useState } from "react"
import { Download, FileSpreadsheet, Activity, Loader2 } from "lucide-react"
import { PageHeader } from "@/components/common/PageHeader"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { exportService } from "@/services/export.service"
import { toast } from "sonner"
import * as XLSX from "xlsx"

function downloadAsExcel(data: any[], sheetName: string, filename: string) {
  if (!data.length) { toast.error("No data to export"); return }
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(data)

  // Auto column widths
  const cols = Object.keys(data[0]).map((key) => ({
    wch: Math.max(key.length, ...data.map((r) => String(r[key] ?? "").length).slice(0, 100)) + 2
  }))
  ws["!cols"] = cols

  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  XLSX.writeFile(wb, filename)
  toast.success(`${filename} downloaded ✅`)
}

export default function ExportPage() {
  const [loading, setLoading] = useState<string | null>(null)

  const exportActivity = async () => {
    setLoading("activity")
    try {
      const data = await exportService.getActivity()
      downloadAsExcel(data, "Activity Log", `activity_log_${new Date().toISOString().slice(0, 10)}.xlsx`)
    } catch { toast.error("Export failed") } finally { setLoading(null) }
  }

  const exportDocuments = async () => {
    setLoading("documents")
    try {
      const data = await exportService.getDocuments()
      downloadAsExcel(data, "Documents", `documents_${new Date().toISOString().slice(0, 10)}.xlsx`)
    } catch { toast.error("Export failed") } finally { setLoading(null) }
  }

  return (
    <>
      <PageHeader title="Export" subtitle="Download your data as proper Excel (.xlsx) files." />
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Activity className="h-6 w-6" />
          </div>
          <h3 className="mb-1 font-semibold">Activity Log</h3>
          <p className="mb-4 text-sm text-muted-foreground">All uploads, downloads, shares, and searches — last 1000 entries.</p>
          <Button onClick={exportActivity} disabled={loading === "activity"} variant="outline" className="w-full">
            {loading === "activity" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Download as Excel (.xlsx)
          </Button>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-flame/10 text-flame">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <h3 className="mb-1 font-semibold">Document List</h3>
          <p className="mb-4 text-sm text-muted-foreground">All documents with title, category, tags, size, status, and upload date.</p>
          <Button onClick={exportDocuments} disabled={loading === "documents"} variant="outline" className="w-full">
            {loading === "documents" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Download as Excel (.xlsx)
          </Button>
        </Card>
      </div>
    </>
  )
}
