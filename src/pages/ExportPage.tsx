
import { useState } from "react"
import {
  Download,
  FileSpreadsheet,
  Activity,
  Loader2,
  FolderArchive,
} from "lucide-react"
import { PageHeader } from "@/components/common/PageHeader"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { exportService } from "@/services/export.service"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import * as XLSX from "xlsx"

function downloadAsExcel(
  data: any[],
  sheetName: string,
  filename: string,
) {
  if (!data.length) {
    toast.error("No data to export")
    return
  }

  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(data)

  const columns = Object.keys(data[0]).map((key) => ({
    wch:
      Math.max(
        key.length,
        ...data
          .map((row) => String(row[key] ?? "").length)
          .slice(0, 100),
      ) + 2,
  }))

  worksheet["!cols"] = columns

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  XLSX.writeFile(workbook, filename)

  toast.success(`${filename} downloaded successfully`)
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()

  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function ExportPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const { user } = useAuth()
  const isAdmin = user?.role === "ADMIN"

  const exportActivity = async () => {
    setLoading("activity")

    try {
      const data = await exportService.getActivity()

      downloadAsExcel(
        data,
        "Activity Log",
        `activity_log_${new Date().toISOString().slice(0, 10)}.xlsx`,
      )
    } catch {
      toast.error("Activity export failed")
    } finally {
      setLoading(null)
    }
  }

  const exportDocuments = async () => {
    setLoading("documents")

    try {
      const data = await exportService.getDocuments()

      downloadAsExcel(
        data,
        "Documents",
        `documents_${new Date().toISOString().slice(0, 10)}.xlsx`,
      )
    } catch {
      toast.error("Document export failed")
    } finally {
      setLoading(null)
    }
  }

  const exportInventory = async () => {
    setLoading("inventory")

    try {
      const blob = await exportService.downloadDocumentInventory()

      if (!blob.size) {
        toast.error("The inventory export returned an empty file")
        return
      }

      downloadBlob(blob, "Document_Inventory.xlsx")
      toast.success("Document inventory downloaded successfully")
    } catch {
      toast.error("Document inventory export failed")
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      <PageHeader
        title="Export"
        subtitle="Download your document data and reports."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card className="p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Activity className="h-6 w-6" />
          </div>

          <h3 className="mb-1 font-semibold">Activity Log</h3>

          <p className="mb-4 text-sm text-muted-foreground">
            Uploads, downloads, shares, and searches from the last 1,000
            activity entries.
          </p>

          <Button
            onClick={exportActivity}
            disabled={loading !== null}
            variant="outline"
            className="w-full"
          >
            {loading === "activity" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download as Excel (.xlsx)
          </Button>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-flame/10 text-flame">
            <FileSpreadsheet className="h-6 w-6" />
          </div>

          <h3 className="mb-1 font-semibold">Document List</h3>

          <p className="mb-4 text-sm text-muted-foreground">
            Document titles, categories, tags, sizes, status, and upload dates.
          </p>

          <Button
            onClick={exportDocuments}
            disabled={loading !== null}
            variant="outline"
            className="w-full"
          >
            {loading === "documents" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download as Excel (.xlsx)
          </Button>
        </Card>

        {isAdmin && (
          <Card className="p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FolderArchive className="h-6 w-6" />
            </div>

            <h3 className="mb-1 font-semibold">Document Inventory</h3>

            <p className="mb-4 text-sm text-muted-foreground">
              Complete active-document inventory with product name, category,
              folder path, original filename, and document ID.
            </p>

            <Button
              onClick={exportInventory}
              disabled={loading !== null}
              variant="outline"
              className="w-full"
            >
              {loading === "inventory" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download Inventory (.xlsx)
            </Button>
          </Card>
        )}
      </div>
    </>
  )
}
