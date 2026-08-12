import { Sparkles } from "lucide-react"
import { PageHeader } from "./PageHeader"
import { EmptyState } from "./EmptyState"

export function ModulePlaceholder({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />
      <EmptyState
        icon={Sparkles}
        title={`${title} module`}
        description="This module is generated next in the build order and will render here."
      />
    </>
  )
}
