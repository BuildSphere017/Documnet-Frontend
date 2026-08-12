import { toast } from "sonner"
import { documentService } from "@/services/document.service"

interface SharePayload {
  title: string
  text?: string
  url: string
}

/**
 * Opens the device's native share sheet (WhatsApp, Instagram, etc.) when available
 * (works great on phones). Falls back to WhatsApp Web / copy-link on desktop.
 */
export async function nativeShare({ title, text, url }: SharePayload) {
  const message = `${text ?? title}\n${url}`

  // 1) Native share sheet (mobile + some desktops)
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url })
      return
    } catch (err: any) {
      if (err?.name === "AbortError") return // user cancelled — do nothing
    }
  }

  // 2) Desktop fallback → open WhatsApp with the message prefilled
  const wa = `https://wa.me/?text=${encodeURIComponent(message)}`
  window.open(wa, "_blank", "noopener,noreferrer")
}

export async function copyLink(url: string) {
  try {
    await navigator.clipboard.writeText(url)
    toast.success("Link copied")
  } catch {
    toast.error("Couldn't copy link")
  }
}

export function shareToWhatsApp(url: string, text?: string) {
  const msg = `${text ? text + "\n" : ""}${url}`
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer")
}

/** True when this browser can share actual files through the native share sheet. */
export function canShareFiles(): boolean {
  try {
    // navigator.canShare with a probe file — supported mainly on mobile browsers.
    return typeof navigator !== "undefined"
      && typeof navigator.canShare === "function"
      && navigator.canShare({ files: [new File([""], "probe.txt", { type: "text/plain" })] })
  } catch {
    return false
  }
}

/**
 * Share the ACTUAL file (not a link) through the device's native share sheet.
 * On phones this lets the user drop the real PDF straight into WhatsApp / Gmail / etc.
 * On desktop (where file-sharing isn't supported) it falls back to downloading the file.
 */
export async function shareFileDirectly(
  documentId: string,
  title: string,
  onDownloadFallback: (id: string) => void,
): Promise<void> {
  const toastId = toast.loading("Preparing file…")
  try {
    const { url, fileName } = await documentService.getDownloadUrl(documentId)
    const res = await fetch(url)
    if (!res.ok) throw new Error("fetch failed")
    const blob = await res.blob()
    const file = new File([blob], fileName || `${title}`, { type: blob.type || "application/octet-stream" })

    if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
      toast.dismiss(toastId)
      try {
        await navigator.share({ files: [file], title, text: title })
      } catch (err: any) {
        if (err?.name !== "AbortError") toast.error("Couldn't open the share sheet")
      }
      return
    }

    // Desktop / unsupported → download the real file so the user can attach it manually
    toast.dismiss(toastId)
    onDownloadFallback(documentId)
    toast.message("Your browser can't share files directly — the file was downloaded so you can attach it.")
  } catch {
    toast.dismiss(toastId)
    // Last resort: trigger a normal download
    onDownloadFallback(documentId)
    toast.error("Couldn't share the file directly — downloaded it instead.")
  }
}